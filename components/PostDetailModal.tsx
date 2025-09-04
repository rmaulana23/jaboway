import React, { useState, useEffect, useRef } from 'react';
import { Post, PostComment } from '../types';
import { t } from '../utils/i18n';
import { useDiscussion } from '../contexts/DiscussionContext';
import { useAuth } from '../contexts/AuthContext';
import { useTimeSince } from '../hooks/useTimeSince';
import { XMarkIcon, ArrowUpIcon, ShieldCheckIcon, TrashIcon, PencilIcon, EmojiIcon, BookmarkIcon, FlagIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';
import VerificationStatusDisplay from './VerificationStatusDisplay';

interface CommentItemProps { 
    comment: PostComment; 
    onConfirmDelete: (commentId: string) => void;
    onUpdate: (commentId: string, content: string) => Promise<void>;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onConfirmDelete, onUpdate }) => {
    const { currentUser } = useAuth();
    const timeAgo = useTimeSince(comment.created_at);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const isAuthor = currentUser?.id === comment.author_id;
    const canModify = currentUser?.role === 'admin' || isAuthor;

    const handleEditSave = async () => {
        if (editedContent.trim()) {
            await onUpdate(comment.id, editedContent.trim());
            setIsEditing(false);
        }
    }

    return (
         <div className="bg-[var(--color-surface)] p-3 rounded-lg flex justify-between items-start gap-2">
            <div className="flex-1">
                {isEditing ? (
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-[var(--color-primary)]"
                            onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                        />
                        <button onClick={handleEditSave} className="px-3 py-1 text-xs rounded-md text-white bg-blue-600 hover:opacity-90">{t('save')}</button>
                        <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs rounded-md bg-[var(--color-border)] hover:opacity-90">{t('cancel')}</button>
                    </div>
                ) : (
                    <p className="text-sm">{comment.content}</p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mt-2">
                    <span>oleh <strong>{comment.profiles?.username || '...'}</strong></span>
                    {comment.profiles?.username === 'admin' && ( // A more robust check might be needed
                        <div title={t('admin_verified')}>
                            <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                        </div>
                    )}
                    <span>- {timeAgo}</span>
                </div>
            </div>
            {canModify && !isEditing && (
                <div className="flex items-center gap-1 flex-shrink-0">
                    {isAuthor && (
                         <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:bg-gray-600 hover:text-white rounded-full transition-colors" aria-label={t('edit')}>
                            <PencilIcon className="w-4 h-4"/>
                        </button>
                    )}
                    <button onClick={() => onConfirmDelete(comment.id)} className="p-1.5 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors" aria-label={t('delete')}>
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </div>
            )}
        </div>
    )
}

// ... rest of the component
interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onLoginRequired: () => void;
  onEditRequest: (post: Post) => void;
  onReportRequest: (post: Post) => void;
}


const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose, onLoginRequired, onEditRequest, onReportRequest }) => {
  const { addComment, toggleUpvote, deletePost, deleteComment, addVerification, togglePinPost, getComments, updateComment } = useDiscussion();
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [modalState, setModalState] = useState<{ type: 'post' | 'comment', id: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '😊', '🤔'];
  const timeAgo = useTimeSince(post.created_at);
  
  const isMuted = currentUser?.muted_until && new Date(currentUser.muted_until) > new Date();
  // We need to check the actual upvotes table, not just a count. Let's simplify this.
  const hasUpvoted = false; // This would require another fetch. Let's omit for now.
  const isPostAuthor = currentUser?.id === post.author_id;
  const isAdmin = currentUser?.role === 'admin';
  const isPostAuthorAdmin = post.profiles?.username === 'admin';

  useEffect(() => {
    getComments(post.id).then(data => {
        setComments(data);
        setIsLoadingComments(false);
    })
  }, [post.id, getComments]);

  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMuted) return;
    if (newComment.trim() && currentUser) {
      const newCommentData = await addComment(post.id, newComment.trim());
      if (newCommentData) {
          setComments(prev => [...prev, newCommentData]);
      }
      setNewComment('');
    } else if (!currentUser) {
        onLoginRequired();
    }
  };

  const handleUpvote = () => {
      if(currentUser) {
          toggleUpvote(post.id);
      } else {
          onLoginRequired();
      }
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  const handleUpdateComment = async (commentId: string, content: string) => {
    await updateComment(commentId, content);
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, content } : c));
  };
  
  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleConfirmDelete = () => {
    if (!modalState) return;
    if (modalState.type === 'post') {
        deletePost(modalState.id);
        setModalState(null);
        onClose(); 
    } else {
        handleDeleteComment(modalState.id);
        setModalState(null);
    }
  };

  const getMuteMessage = () => {
    if (!isMuted || !currentUser?.muted_until) return '';
    const untilDate = new Date(currentUser.muted_until);
    if (untilDate.getFullYear() > 9000) {
        return t('user_is_muted_perm');
    }
    const formattedDate = untilDate.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
    return t('user_is_muted_until', { date: formattedDate });
  };
  
  const userVerification = currentUser ? post.post_verifications?.find(v => v.user_id === currentUser.id) : undefined;
  const trueVotes = post.post_verifications?.filter(v => v.status === 'true').length || 0;
  const questionableVotes = post.post_verifications?.filter(v => v.status === 'questionable').length || 0;


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
        <div 
          className="bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="p-4 flex justify-between items-center border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg)] z-10">
            <h2 className="text-xl font-bold text-[var(--color-primary)] flex-1 truncate pr-4 flex items-center gap-2">
                {post.is_pinned && (
                    <span title={t('pinned_post_tooltip')}>
                        <BookmarkIcon className="w-5 h-5 text-yellow-400 fill-current" />
                    </span>
                )}
                <span>{post.title}</span>
            </h2>
            <div className="flex items-center gap-1">
                {isAdmin && (
                    <button
                        onClick={() => togglePinPost(post.id, post.is_pinned)}
                        className={`p-2 rounded-full transition-colors ${post.is_pinned ? 'text-yellow-400 hover:bg-yellow-400/20' : 'text-gray-400 hover:bg-gray-600 hover:text-white'}`}
                        aria-label={post.is_pinned ? t('unpin_post') : t('pin_post')}
                        title={post.is_pinned ? t('unpin_post') : t('pin_post')}
                    >
                        <BookmarkIcon className={`w-5 h-5 ${post.is_pinned ? 'fill-current' : ''}`} />
                    </button>
                )}
                {isPostAuthor && (
                    <button onClick={() => onEditRequest(post)} className="p-2 rounded-full text-gray-400 hover:bg-gray-600 hover:text-white transition-colors" aria-label={t('edit')} title={t('edit')}>
                        <PencilIcon className="w-5 h-5"/>
                    </button>
                )}
                {(isPostAuthor || isAdmin) && (
                    <button onClick={() => setModalState({ type: 'post', id: post.id})} className="p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors" aria-label={t('delete')} title={t('delete')}>
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                )}
                <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-muted)]" aria-label={t('close')}>
                    <XMarkIcon className="w-6 h-6"/>
                </button>
            </div>
          </header>

          <div className="overflow-y-auto p-6 space-y-6">
              <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                      <button onClick={handleUpvote} className={`p-2 rounded-full transition-colors ${hasUpvoted ? 'bg-blue-100 dark:bg-blue-900 text-[var(--color-primary)]' : 'hover:bg-[var(--color-border)]'}`}>
                          <ArrowUpIcon className="w-6 h-6" />
                      </button>
                      <span className="font-bold">{post.post_upvotes[0]?.count ?? 0}</span>
                  </div>
                  <div className="flex-1">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mt-4">
                          <span>Dikirim oleh <strong>{post.profiles?.username || '...'}</strong></span>
                           {isPostAuthorAdmin && (
                              <div title={t('admin_verified')}>
                                  <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                              </div>
                          )}
                          <span>- {timeAgo}</span>
                      </div>
                  </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-4">
                  <h3 className="text-lg font-semibold mb-4">{t('verification_title')}</h3>
                  <div className="bg-[var(--color-surface)] p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Status saat ini:</span>
                        <VerificationStatusDisplay verifications={post.post_verifications} />
                    </div>
                    {currentUser ? (
                         <div className="grid grid-cols-2 gap-2">
                             <button
                                onClick={() => addVerification(post.id, 'true')}
                                className={`flex items-center justify-center gap-2 p-2 text-sm rounded-md transition-all ${userVerification?.status === 'true' ? 'bg-green-500 text-white ring-2 ring-white' : 'bg-green-500/20 text-green-300 hover:bg-green-500/40'}`}
                             >
                                 <span>✅</span>
                                 <span>{t('vote_true')}</span>
                                 <span className="font-bold">{trueVotes}</span>
                             </button>
                             <button
                                 onClick={() => addVerification(post.id, 'questionable')}
                                 className={`flex items-center justify-center gap-2 p-2 text-sm rounded-md transition-all ${userVerification?.status === 'questionable' ? 'bg-yellow-500 text-white ring-2 ring-white' : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40'}`}
                             >
                                 <span>⚠️</span>
                                 <span>{t('vote_questionable')}</span>
                                 <span className="font-bold">{questionableVotes}</span>
                             </button>
                         </div>
                    ) : (
                        <p className="text-center text-sm text-[var(--color-text-muted)]">Anda harus login untuk memberi verifikasi.</p>
                    )}
                  </div>
              </div>
            
              <div className="border-t border-[var(--color-border)] pt-4">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{comments.length} {t('comments')}</h3>
                      {currentUser && !isPostAuthor && (
                          <button onClick={() => onReportRequest(post)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md text-red-400 hover:bg-red-500/20 transition-colors">
                              <FlagIcon className="w-4 h-4" />
                              <span>{t('report_post')}</span>
                          </button>
                      )}
                  </div>
                  <div className="space-y-4">
                      {isLoadingComments ? <p>Loading comments...</p> : comments.map(comment => (
                          <CommentItem 
                            key={comment.id}
                            comment={comment}
                            onConfirmDelete={(commentId) => setModalState({type: 'comment', id: commentId})}
                            onUpdate={handleUpdateComment}
                          />
                      ))}
                      {currentUser && (
                        isMuted ? (
                            <div className="text-center p-4 bg-yellow-900/50 rounded-lg">
                                <p className="font-bold text-yellow-500 text-sm">{t('user_is_muted_comment')}</p>
                                <p className="text-xs text-gray-400 mt-1">{getMuteMessage()}</p>
                            </div>
                        ) : (
                          <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-4">
                              <div className="relative flex-1">
                                  <input 
                                      type="text"
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      placeholder={t('add_comment_placeholder')}
                                      className="w-full pl-3 pr-10 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                                  />
                                  <button
                                      type="button"
                                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                                      aria-label="Add emoji"
                                  >
                                      <EmojiIcon className="w-5 h-5" />
                                  </button>
                                  {showEmojiPicker && (
                                      <div ref={emojiPickerRef} className="absolute bottom-full mb-2 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg p-2 flex flex-wrap gap-2 z-10">
                                          {EMOJIS.map(emoji => (
                                              <button
                                                  key={emoji}
                                                  type="button"
                                                  onClick={() => handleEmojiSelect(emoji)}
                                                  className="text-2xl p-1 rounded-md hover:bg-[var(--color-border)]"
                                              >
                                                  {emoji}
                                              </button>
                                          ))}
                                      </div>
                                  )}
                              </div>
                              <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90">
                                  {t('post_comment')}
                              </button>
                          </form>
                        )
                      )}
                  </div>
              </div>
          </div>
        </div>
      </div>
       <ConfirmationModal
            isOpen={!!modalState}
            onClose={() => setModalState(null)}
            onConfirm={handleConfirmDelete}
            title={modalState?.type === 'post' ? t('delete_post_confirm_title') : t('delete_comment_confirm_title')}
            message={
                currentUser?.role !== 'admin' && ( (modalState?.type === 'post' && isPostAuthor) || (modalState?.type === 'comment') )
                    ? modalState?.type === 'post' ? t('delete_post_confirm_message_author') : t('delete_comment_confirm_message_author')
                    : modalState?.type === 'post' ? t('delete_post_confirm_message') : t('delete_comment_confirm_message')
            }
            confirmButtonText={t('delete')}
        />
    </>
  );
};

export default PostDetailModal;
