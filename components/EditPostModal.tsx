import React, { useState, useEffect } from 'react';
import { useDiscussion } from '../contexts/DiscussionContext';
import { t } from '../utils/i18n';
import { DiscussionCategory, Post } from '../types';
import { XMarkIcon } from './icons';
import { DISCUSSION_CATEGORIES } from '../constants';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose }) => {
  const { updatePost } = useDiscussion();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  // FIX: Cast string from post.category to DiscussionCategory enum type for state initialization.
  const [category, setCategory] = useState<DiscussionCategory>(post.category as DiscussionCategory);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Judul dan detail tidak boleh kosong.');
      return;
    }
    updatePost(post.id, { title, content, category });
    alert(t('post_updated_success'));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-lg shadow-xl w-full max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">{t('edit_post_title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-muted)]" aria-label={t('close')}>
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label htmlFor="edit-post-title" className="block text-sm font-medium">{t('post_title')}</label>
            <input type="text" id="edit-post-title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" />
          </div>
          <div>
            <label htmlFor="edit-post-content" className="block text-sm font-medium">{t('post_content')}</label>
            <textarea id="edit-post-content" value={content} onChange={e => setContent(e.target.value)} required rows={5} className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"></textarea>
          </div>
          <div>
              <label htmlFor="edit-post-category" className="block text-sm font-medium">{t('post_category')}</label>
              <select id="edit-post-category" value={category} onChange={e => setCategory(e.target.value as DiscussionCategory)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-[var(--color-bg)] border-[var(--color-border)] focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md">
                  {DISCUSSION_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
          </div>
          <div className="flex justify-end pt-4 gap-2">
              <button type="button" onClick={onClose} className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-[var(--color-border)] shadow-sm text-sm font-medium rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-border)]">
                {t('cancel')}
              </button>
              <button type="submit" className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90">
                {t('save')}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;