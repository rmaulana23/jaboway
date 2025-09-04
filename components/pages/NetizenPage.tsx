
import React, { useState } from 'react';
import { t } from '../../utils/i18n';
import { useGuides } from '../../contexts/GuidesContext';
import { useAuth } from '../../contexts/AuthContext';
import { Guide } from '../../types';
import GuideCard from '../GuideCard';
import GuideSubmissionForm from '../GuideSubmissionForm';
import ConfirmationModal from '../ConfirmationModal';


interface NetizenPageProps {
  onGuideSelect: (guide: Guide) => void;
  onNavigate: (target: string) => void;
  openFormInitially?: boolean;
}

const NetizenPage: React.FC<NetizenPageProps> = ({ onGuideSelect, onNavigate, openFormInitially = false }) => {
  const { netizenGuides, addGuide, userGuides, updateGuide, deleteGuide } = useGuides();
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(openFormInitially);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null);

  const handleShowForm = () => {
      if (currentUser) {
        setShowForm(true);
      } else {
        onNavigate('login-required');
      }
  }

  const handleConfirmDelete = () => {
    if (guideToDelete) {
        deleteGuide(guideToDelete);
        setGuideToDelete(null);
    }
  };
  

  if (editingGuide) {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <GuideSubmissionForm
                initialData={editingGuide}
                onCancel={() => setEditingGuide(null)}
                onSubmit={(data) => {
                    // FIX: Type error for category handled in GuidesContext.tsx
                    updateGuide(editingGuide.id, data);
                    setEditingGuide(null);
                }}
                submitButtonText={t('update_guide')}
                formTitle={`${t('edit')}: ${editingGuide.title}`}
            />
        </div>
    );
  }

  if (showForm) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <GuideSubmissionForm 
                onCancel={() => setShowForm(false)} 
                onSubmit={(guideData) => {
                    // FIX: Type error for category handled in GuidesContext.tsx
                    addGuide(guideData);
                    setShowForm(false);
                }}
                submitButtonText={t('submit')}
                formTitle={t('form_title')}
            />
        </div>
      )
  }

  // FIX: Filter user's guides by author_id instead of non-existent `author` property.
  const myGuides = currentUser ? userGuides.filter(g => g.author_id === currentUser.id) : [];
  
  // FIX: Filter community guides by author_id to exclude the current user's guides.
  const communityGuides = currentUser?.role === 'admin'
    ? netizenGuides
    : netizenGuides.filter(guide => guide.author_id !== currentUser?.id);


  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {currentUser && myGuides.length > 0 && (
              <section>
                  <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{t('my_submissions')}</h2>
                  <div className="bg-[var(--color-surface)] shadow-md rounded-lg border border-[var(--color-border)] overflow-hidden">
                      <ul className="divide-y divide-[var(--color-border)]">
                          {myGuides.map(guide => (
                              <li key={guide.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                  <div>
                                      <h3 className="font-bold text-lg">{guide.title}</h3>
                                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${guide.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                        {guide.status === 'approved' ? t('status_approved') : t('status_pending')}
                                      </span>
                                  </div>
                                  <div className="flex-shrink-0 flex items-center space-x-2 self-start md:self-center">
                                      <button
                                          onClick={() => setEditingGuide(guide)}
                                          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                      >
                                          {t('edit')}
                                      </button>
                                      <button
                                          onClick={() => setGuideToDelete(guide.id)}
                                          className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                                      >
                                          {t('delete')}
                                      </button>
                                  </div>
                              </li>
                          ))}
                      </ul>
                  </div>
              </section>
          )}

          <section>
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold">{t('all_netizen_guides')}</h2>
                  <button
                      onClick={handleShowForm}
                      className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity"
                  >
                      {t('submit_your_guide')}
                  </button>
              </div>

              {communityGuides.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communityGuides.map(guide => (
                        <div key={guide.id} className="relative group">
                            <GuideCard guide={guide} onSelect={onGuideSelect} />
                             {currentUser?.role === 'admin' && (
                                <div className="absolute top-0 right-0 p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex space-x-1 bg-gray-800 bg-opacity-60 rounded-bl-lg rounded-tr-lg">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingGuide(guide); }}
                                        className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                        aria-label={`${t('edit')} ${guide.title}`}
                                    >
                                        {t('edit')}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setGuideToDelete(guide.id); }}
                                        className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                                        aria-label={`${t('delete')} ${guide.title}`}
                                    >
                                        {t('delete')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-16 bg-[var(--color-surface)] rounded-lg border border-dashed border-[var(--color-border)]">
                    <p className="text-[var(--color-text-muted)]">{t('no_netizen_guides_found')}</p>
                  </div>
              )}
          </section>
      </div>
      <ConfirmationModal
        isOpen={!!guideToDelete}
        onClose={() => setGuideToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('delete_confirm_title')}
        message={t('delete_confirm')}
        confirmButtonText={t('delete')}
      />
    </>
  );
};

export default NetizenPage;