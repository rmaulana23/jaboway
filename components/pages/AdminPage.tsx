import React, { useState } from 'react';
import { useGuides } from '../../contexts/GuidesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDiscussion } from '../../contexts/DiscussionContext';
import { t } from '../../utils/i18n';
import { Guide, Profile, Post } from '../../types';
import GuideSubmissionForm from '../GuideSubmissionForm';
import ConfirmationModal from '../ConfirmationModal';
import GuideDetailModal from '../GuideDetailModal';
import { XMarkIcon, MicrophoneSlashIcon, ExclamationTriangleIcon } from '../icons';

const AdminPage: React.FC = () => {
    const { pendingGuides, approvedGuides, approveGuide, deleteGuide: deleteGuideAction, updateGuide } = useGuides();
    const { users, currentUser, blockUser, unblockUser, muteUser, unmuteUser, warnUser } = useAuth();
    const { posts, deletePost, resolveReports } = useDiscussion();
    
    const [activeTab, setActiveTab] = useState('guides');
    const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
    const [guideToPreview, setGuideToPreview] = useState<Guide | null>(null);
    const [guideModalState, setGuideModalState] = useState<{ type: 'delete' | 'reject', guideId: string } | null>(null);
    const [userModalState, setUserModalState] = useState<{ type: 'block' | 'unblock', user: Profile } | null>(null);
    const [userToMute, setUserToMute] = useState<Profile | null>(null);
    const [userToWarn, setUserToWarn] = useState<Profile | null>(null);
    const [warningMessage, setWarningMessage] = useState('');
    const [reportModalState, setReportModalState] = useState<{ type: 'dismiss' | 'delete', post: Post } | null>(null);

    const handleGuideConfirmAction = () => {
        if (guideModalState) {
            deleteGuideAction(guideModalState.guideId);
            setGuideModalState(null);
        }
    };
    
    const handleReportConfirmAction = () => {
        if (!reportModalState) return;
        if (reportModalState.type === 'dismiss') {
            resolveReports(reportModalState.post.id);
        } else { // delete
            deletePost(reportModalState.post.id);
        }
        setReportModalState(null);
    };

    const handleUserConfirmAction = () => {
        if (userModalState) {
            if (userModalState.type === 'block') {
                blockUser(userModalState.user.id);
            } else {
                unblockUser(userModalState.user.id);
            }
            setUserModalState(null);
        }
    };

    const handleMute = (duration: '24h' | '3d' | '7d' | 'perm') => {
        if (!userToMute) return;
        let until: string | null;
        if (duration === 'perm') {
            until = new Date('9999-12-31T23:59:59Z').toISOString();
        } else {
            const now = new Date();
            let hours: number;
            switch (duration) {
                case '24h': hours = 24; break;
                case '3d': hours = 3 * 24; break;
                case '7d': hours = 7 * 24; break;
                default: hours = 0;
            }
            now.setHours(now.getHours() + hours);
            until = now.toISOString();
        }
        muteUser(userToMute.id, until);
        setUserToMute(null);
    };
    
    const handleUnmute = (userId: string) => {
        unmuteUser(userId);
    };

    const handleSendWarning = () => {
        if (userToWarn && warningMessage.trim()) {
            warnUser(userToWarn.id, warningMessage.trim());
            setUserToWarn(null);
            setWarningMessage('');
        }
    };

    if (editingGuide) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <GuideSubmissionForm
                    initialData={editingGuide as any} // Cast to satisfy form props
                    onCancel={() => setEditingGuide(null)}
                    onSubmit={(data) => {
                        updateGuide(editingGuide.id, data as any);
                        setEditingGuide(null);
                    }}
                    submitButtonText={t('update_guide')}
                    formTitle={`${t('edit')}: ${editingGuide.title}`}
                />
            </div>
        )
    }
    
    const reportedPosts = posts.filter(p => p.post_reports && p.post_reports.length > 0);

    const GuideRow = ({ guide, isPending = false }: { guide: Guide; isPending?: boolean }) => (
         <li className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h3 className="font-bold text-lg">{guide.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                    {t('admin_by')} {guide.profiles?.username} | {t('admin_category')}: {guide.category} | {t('admin_city')}: {guide.city}
                </p>
                <p className="text-sm mt-2 text-[var(--color-text-primary)]">
                    <strong>{t('admin_first_step')}:</strong> {guide.steps[0] || 'N/A'}
                </p>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-2 self-start md:self-center">
                {isPending ? (
                    <>
                        <button onClick={() => setGuideToPreview(guide)} className="px-3 py-1 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-md transition-colors">{t('view')}</button>
                        <button onClick={() => approveGuide(guide.id)} className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">{t('approve')}</button>
                        <button onClick={() => setGuideModalState({ type: 'reject', guideId: guide.id })} className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">{t('reject')}</button>
                    </>
                ) : (
                    <>
                         <button onClick={() => setEditingGuide(guide)} className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">{t('edit')}</button>
                        <button onClick={() => setGuideModalState({ type: 'delete', guideId: guide.id })} className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">{t('delete')}</button>
                    </>
                )}
            </div>
        </li>
    );

    const UserRow = ({ user }: { user: Profile }) => {
        const isMuted = user.muted_until && new Date(user.muted_until) > new Date();
        const hasPendingWarning = Array.isArray(user.warnings) && user.warnings.some((w: any) => !w.acknowledged);

        let statusText = t('user_status_active');
        let statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        if (user.status === 'blocked') {
            statusText = t('user_status_blocked');
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        } else if (isMuted) {
            statusText = t('user_status_muted');
            statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        }

        return (
            <li className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        {user.username}
                        {hasPendingWarning && <span title="Has pending warnings"><ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" /></span>}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                     <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClass}`}>
                        {statusText}
                    </span>
                    <div className="flex items-center gap-2">
                        {user.status === 'active' ? (
                            <>
                                {isMuted ? (
                                    <button onClick={() => handleUnmute(user.id)} className="p-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-full transition-colors" title="Unmute"><MicrophoneSlashIcon className="w-4 h-4" /></button>
                                ) : (
                                    <button onClick={() => setUserToMute(user)} className="p-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-full transition-colors" title={t('mute_user')}><MicrophoneSlashIcon className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => setUserToWarn(user)} className="p-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-full transition-colors" title={t('warn_user')}><ExclamationTriangleIcon className="w-4 h-4" /></button>
                                <button onClick={() => setUserModalState({ type: 'block', user })} className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">{t('block_user')}</button>
                            </>
                        ) : (
                            <button onClick={() => setUserModalState({ type: 'unblock', user })} className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">{t('unblock_user')}</button>
                        )}
                    </div>
                </div>
            </li>
        )
    };

    const otherUsers = users.filter(u => u.id !== currentUser?.id);

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="mb-6 border-b border-[var(--color-border)]">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                         <button
                            onClick={() => setActiveTab('guides')}
                            className={`${activeTab === 'guides' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                         >
                            {t('admin_guides_tab')}
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`${activeTab === 'users' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                         >
                            {t('admin_users_tab')}
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`${activeTab === 'reports' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                         >
                            {t('admin_reports_tab')}
                        </button>
                    </nav>
                </div>

                {activeTab === 'guides' && (
                    <div className="space-y-12">
                        <section>
                             <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{t('admin_pending_title')}</h2>
                             <div className="bg-[var(--color-surface)] shadow-md rounded-lg border border-[var(--color-border)] overflow-hidden">
                                {pendingGuides.length > 0 ? (
                                    <ul className="divide-y divide-[var(--color-border)]">
                                        {pendingGuides.map(guide => <GuideRow key={guide.id} guide={guide} isPending={true} />)}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center"><p className="text-[var(--color-text-muted)]">{t('no_pending_guides')}</p></div>
                                )}
                            </div>
                        </section>
                        <section>
                             <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{t('admin_approved_title')}</h2>
                             <div className="bg-[var(--color-surface)] shadow-md rounded-lg border border-[var(--color-border)] overflow-hidden">
                                {approvedGuides.length > 0 ? (
                                    <ul className="divide-y divide-[var(--color-border)]">
                                        {approvedGuides.map(guide => <GuideRow key={guide.id} guide={guide} />)}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center"><p className="text-[var(--color-text-muted)]">{t('no_approved_guides')}</p></div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'users' && (
                    <section>
                         <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{t('admin_users_tab')}</h2>
                         <div className="bg-[var(--color-surface)] shadow-md rounded-lg border border-[var(--color-border)] overflow-hidden">
                            {otherUsers.length > 0 ? (
                                <ul className="divide-y divide-[var(--color-border)]">
                                    {otherUsers.map(user => <UserRow key={user.id} user={user} />)}
                                </ul>
                            ) : (
                                <div className="p-8 text-center"><p className="text-[var(--color-text-muted)]">No other users found.</p></div>
                            )}
                        </div>
                    </section>
                )}
                
                {activeTab === 'reports' && (
                    <section>
                         <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{t('admin_reports_title')}</h2>
                         <div className="bg-[var(--color-surface)] shadow-md rounded-lg border border-[var(--color-border)] overflow-hidden">
                            {reportedPosts.length > 0 ? (
                                <ul className="divide-y divide-[var(--color-border)]">
                                    {reportedPosts.map(post => (
                                        <li key={post.id} className="p-4 space-y-4">
                                            <div>
                                                <h3 className="font-bold text-lg">{post.title}</h3>
                                                <p className="text-sm text-[var(--color-text-muted)]">oleh {post.profiles?.username}</p>
                                                <p className="text-sm mt-2 p-2 bg-gray-800 rounded-md whitespace-pre-wrap">{post.content}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm mb-2">{t('reported_by')}:</h4>
                                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                                    {post.post_reports?.map(report => (
                                                        <li key={report.id} className="text-xs p-2 bg-gray-800 rounded">
                                                            <strong>{report.profiles?.username}:</strong> "{report.reason}"
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setReportModalState({ type: 'dismiss', post })} className="px-3 py-1 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors">{t('dismiss_reports')}</button>
                                                <button onClick={() => setReportModalState({ type: 'delete', post })} className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">{t('delete_post')}</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-8 text-center"><p className="text-[var(--color-text-muted)]">{t('no_reports_found')}</p></div>
                            )}
                        </div>
                    </section>
                )}
            </div>
            
            {/* Action Modals */}
            <ConfirmationModal
                isOpen={!!guideModalState}
                onClose={() => setGuideModalState(null)}
                onConfirm={handleGuideConfirmAction}
                title={guideModalState?.type === 'reject' ? t('reject_confirm_title') : t('delete_confirm_title')}
                message={guideModalState?.type === 'reject' ? t('reject_confirm') : t('delete_confirm')}
                confirmButtonText={guideModalState?.type === 'reject' ? t('reject') : t('delete')}
            />
             <ConfirmationModal
                isOpen={!!userModalState}
                onClose={() => setUserModalState(null)}
                onConfirm={handleUserConfirmAction}
                title={userModalState?.type === 'block' ? t('block_user_confirm_title') : t('unblock_user_confirm_title')}
                message={userModalState?.type === 'block' ? t('block_user_confirm_message') : t('unblock_user_confirm_message')}
                confirmButtonText={userModalState?.type === 'block' ? t('block_user') : t('unblock_user')}
            />
            <ConfirmationModal
                isOpen={!!reportModalState}
                onClose={() => setReportModalState(null)}
                onConfirm={handleReportConfirmAction}
                title={reportModalState?.type === 'dismiss' ? t('dismiss_reports_confirm_title') : t('delete_post_confirm_title')}
                message={reportModalState?.type === 'dismiss' ? t('dismiss_reports_confirm_message') : t('delete_post_confirm_message')}
                confirmButtonText={reportModalState?.type === 'dismiss' ? t('dismiss_reports') : t('delete_post')}
            />
            {guideToPreview && (
                <GuideDetailModal guide={guideToPreview} onClose={() => setGuideToPreview(null)} />
            )}

            {/* Mute Modal */}
            {userToMute && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setUserToMute(null)}>
                    <div className="bg-[var(--color-bg)] rounded-lg shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <header className="p-4 border-b border-[var(--color-border)]"><h2 className="text-lg font-bold">{t('mute_user_confirm_title')}</h2></header>
                        <div className="p-6 space-y-3">
                            <p>{t('mute_user_duration')}:</p>
                            <button onClick={() => handleMute('24h')} className="w-full text-left p-3 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-border)]">{t('mute_user_24h')}</button>
                            <button onClick={() => handleMute('3d')} className="w-full text-left p-3 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-border)]">{t('mute_user_3d')}</button>
                            <button onClick={() => handleMute('7d')} className="w-full text-left p-3 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-border)]">{t('mute_user_7d')}</button>
                            <button onClick={() => handleMute('perm')} className="w-full text-left p-3 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-border)]">{t('mute_user_perm')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warn Modal */}
            {userToWarn && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setUserToWarn(null)}>
                    <div className="bg-[var(--color-bg)] rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                         <header className="p-4 flex justify-between items-center border-b border-[var(--color-border)]">
                            <h2 className="text-lg font-bold">{t('warn_user_title')}</h2>
                            <button onClick={() => setUserToWarn(null)}><XMarkIcon className="w-5 h-5"/></button>
                         </header>
                        <div className="p-6 space-y-3">
                            <label htmlFor="warn-message" className="text-sm">{t('warn_user_message_label')}</label>
                            <textarea
                                id="warn-message"
                                value={warningMessage}
                                onChange={(e) => setWarningMessage(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-[var(--color-primary)]"
                                placeholder={t('warn_user_message_placeholder')}
                            ></textarea>
                        </div>
                         <footer className="p-4 flex justify-end gap-2 border-t border-[var(--color-border)]">
                             <button onClick={() => setUserToWarn(null)} className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-border)]">{t('cancel')}</button>
                            <button onClick={handleSendWarning} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600">{t('send_warning')}</button>
                         </footer>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminPage;
