
import React, { useState } from 'react';
import { useDiscussion } from '../contexts/DiscussionContext';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../utils/i18n';
import { DiscussionCategory } from '../types';
import { XMarkIcon } from './icons';
import { DISCUSSION_CATEGORIES } from '../constants';

interface CreatePostModalProps {
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const { addPost } = useDiscussion();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<DiscussionCategory>(DiscussionCategory.Transportasi);
  const [error, setError] = useState('');

  // FIX: Use `muted_until` instead of `mutedUntil`.
  const isMuted = currentUser?.muted_until && new Date(currentUser.muted_until) > new Date();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMuted) return;
    if (!title.trim() || !content.trim()) {
      setError('Judul dan detail tidak boleh kosong.');
      return;
    }
    addPost({ title, content, category });
    alert(t('post_created_success'));
    onClose();
  };

  const getMuteMessage = () => {
    // FIX: Use `muted_until` instead of `mutedUntil`.
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-lg shadow-xl w-full max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">{t('create_post_title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-muted)]" aria-label={t('close')}>
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </header>
        {isMuted ? (
            <div className="p-6 text-center">
                <p className="font-bold text-yellow-500">{t('user_is_muted_post')}</p>
                <p className="text-sm text-gray-400 mt-2">{getMuteMessage()}</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label htmlFor="post-title" className="block text-sm font-medium">{t('post_title')}</label>
                <input type="text" id="post-title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" placeholder={t('post_title_placeholder')} />
            </div>
            <div>
                <label htmlFor="post-content" className="block text-sm font-medium">{t('post_content')}</label>
                <textarea id="post-content" value={content} onChange={e => setContent(e.target.value)} required rows={5} className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" placeholder={t('post_content_placeholder')}></textarea>
            </div>
            <div>
                <label htmlFor="post-category" className="block text-sm font-medium">{t('post_category')}</label>
                <select id="post-category" value={category} onChange={e => setCategory(e.target.value as DiscussionCategory)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-[var(--color-bg)] border-[var(--color-border)] focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md">
                    {DISCUSSION_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]">
                    {t('submit')}
                </button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default CreatePostModal;