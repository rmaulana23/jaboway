
import React, { useState, useMemo } from 'react';
import { t } from '../../utils/i18n';
import { useDiscussion } from '../../contexts/DiscussionContext';
import { Post, DiscussionCategory } from '../../types';
import { DISCUSSION_CATEGORIES } from '../../constants';
import PostCard from '../PostCard';
import ConfirmationModal from '../ConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';
import { XMarkIcon } from '../icons';

interface DiscussionPageProps {
  onCreatePost: () => void;
  onPostSelect: (post: Post) => void;
  onEditRequest: (post: Post) => void;
}

const DiscussionPage: React.FC<DiscussionPageProps> = ({ onCreatePost, onPostSelect, onEditRequest }) => {
  const { posts, deletePost } = useDiscussion();
  const { currentUser } = useAuth();
  const [sortOrder, setSortOrder] = useState<'popular' | 'newest'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<DiscussionCategory | 'All'>('All');
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [saraWarningVisible, setSaraWarningVisible] = useState(true);
  const [verificationInfoVisible, setVerificationInfoVisible] = useState(true);


  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    if (selectedCategory !== 'All') {
      filtered = posts.filter(post => post.category === selectedCategory);
    }
    
    // FIX: Use `is_pinned` instead of `isPinned`.
    const pinned = filtered.filter(p => p.is_pinned);
    const unpinned = filtered.filter(p => !p.is_pinned);


    if (sortOrder === 'popular') {
      // FIX: Use `post_upvotes` count for sorting.
      unpinned.sort((a, b) => (b.post_upvotes[0]?.count ?? 0) - (a.post_upvotes[0]?.count ?? 0));
    } else { // newest
      // FIX: Use `created_at` instead of `createdAt`.
      unpinned.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    return [...pinned, ...unpinned];
  }, [posts, sortOrder, selectedCategory]);

  const handleConfirmDelete = () => {
    if (postToDelete) {
        deletePost(postToDelete.id);
        setPostToDelete(null);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">{t('discussion_title')}</h1>
          <button
            onClick={onCreatePost}
            className="w-full md:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity"
          >
            {t('new_post')}
          </button>
        </div>

        {saraWarningVisible && (
            <div className="relative bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 my-6 rounded-r-lg" role="alert">
                <button onClick={() => setSaraWarningVisible(false)} className="absolute top-2 right-2 p-1 text-yellow-800 hover:bg-yellow-200 rounded-full" aria-label={t('close')}>
                    <XMarkIcon className="w-4 h-4"/>
                </button>
                <p className="font-bold">{t('sara_warning_title')}</p>
                <p className="text-sm pr-6">{t('sara_warning_content')}</p>
            </div>
        )}

        {verificationInfoVisible && (
            <div className="relative bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 my-6 rounded-r-lg dark:bg-blue-900/50 dark:text-blue-300" role="alert">
                <button onClick={() => setVerificationInfoVisible(false)} className="absolute top-2 right-2 p-1 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full" aria-label={t('close')}>
                    <XMarkIcon className="w-4 h-4"/>
                </button>
                <p className="text-sm whitespace-pre-line pr-6">{t('verification_info_content')}</p>
            </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
              <label htmlFor="category-filter" className="sr-only">{t('filter_by_category')}</label>
              <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as DiscussionCategory | 'All')}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none text-sm"
              >
                  <option value="All">{t('all_discussion_categories')}</option>
                  {DISCUSSION_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                  ))}
              </select>
          </div>
          <div className="flex-1">
              <label htmlFor="sort-order" className="sr-only">{t('sort_by')}</label>
              <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'popular' | 'newest')}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none text-sm"
              >
                  <option value="popular">{`${t('sort_by')}: ${t('sort_popular')}`}</option>
                  <option value="newest">{`${t('sort_by')}: ${t('sort_newest')}`}</option>
              </select>
          </div>
        </div>

        {filteredAndSortedPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onSelect={() => onPostSelect(post)}
                onDeleteRequest={() => setPostToDelete(post)}
                onEditRequest={() => onEditRequest(post)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[var(--color-surface)] rounded-lg border border-dashed border-[var(--color-border)]">
            <p className="text-[var(--color-text-muted)]">{t('no_posts_found')}</p>
          </div>
        )}
      </div>

       <ConfirmationModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('delete_post_confirm_title')}
        message={
            // FIX: Use `author_id` instead of `authorId`.
            currentUser?.role !== 'admin' && currentUser?.id === postToDelete?.author_id
            ? t('delete_post_confirm_message_author')
            : t('delete_post_confirm_message')
        }
        confirmButtonText={t('delete')}
      />
    </>
  );
};

export default DiscussionPage;