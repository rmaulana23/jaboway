import React from 'react';
import { Post } from '../types';
import { t } from '../utils/i18n';
import { useAuth } from '../contexts/AuthContext';
import { useTimeSince } from '../hooks/useTimeSince';
import { ArrowUpIcon, ChatBubbleIcon, ShieldCheckIcon, TrashIcon, PencilIcon, BookmarkIcon } from './icons';
import VerificationStatusDisplay from './VerificationStatusDisplay';
import { useDiscussion } from '../contexts/DiscussionContext';

interface PostCardProps {
  post: Post;
  onSelect: () => void;
  onDeleteRequest: () => void;
  onEditRequest: () => void;
  showAdminControls?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onSelect, onDeleteRequest, onEditRequest, showAdminControls = true }) => {
  const { currentUser } = useAuth();
  const { togglePinPost } = useDiscussion();
  const timeAgo = useTimeSince(post.created_at);
  
  const isAdmin = currentUser?.role === 'admin';
  const isAuthor = currentUser?.id === post.author_id;
  
  // Note: a more robust admin check would be to fetch profiles and check roles
  const isAdminPost = post.profiles?.username === 'admin'; 

  const showControls = showAdminControls && (isAdmin || isAuthor);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteRequest();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditRequest();
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinPost(post.id, post.is_pinned);
  };

  return (
    <div
      onClick={onSelect}
      className="bg-[var(--color-surface)] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-[var(--color-border)] p-4 flex gap-4 relative"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
       {showControls && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
            {isAdmin && (
                <button
                    onClick={handlePin}
                    className={`p-1.5 rounded-full transition-colors ${post.is_pinned ? 'text-yellow-400 hover:bg-yellow-400/20' : 'text-gray-400 hover:bg-gray-600 hover:text-white'}`}
                    aria-label={post.is_pinned ? t('unpin_post') : t('pin_post')}
                    title={post.is_pinned ? t('unpin_post') : t('pin_post')}
                >
                    <BookmarkIcon className={`w-5 h-5 ${post.is_pinned ? 'fill-current' : ''}`} />
                </button>
            )}
            {isAuthor && (
                <button
                    onClick={handleEdit}
                    className="p-1.5 text-gray-400 hover:bg-gray-600 hover:text-white rounded-full transition-colors"
                    aria-label={t('edit')}
                    title={t('edit')}
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
            )}
            {(isAuthor || isAdmin) && (
                <button
                    onClick={handleDelete}
                    className="p-1.5 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                    aria-label={t('delete')}
                    title={t('delete')}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            )}
        </div>
      )}
      <div className="flex flex-col items-center justify-start space-y-1 pt-1">
         <ArrowUpIcon className="w-5 h-5 text-gray-400" />
         <span className="font-bold text-sm">{post.post_upvotes[0]?.count ?? 0}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)]">{post.category}</span>
            <VerificationStatusDisplay verifications={post.post_verifications} />
        </div>
        <h3 className="font-bold text-lg text-[var(--color-primary)] mt-2 pr-16 flex items-center gap-2">
          {post.is_pinned && (
              <span title={t('pinned_post_tooltip')}>
                  <BookmarkIcon className="w-5 h-5 text-yellow-400 fill-current" />
              </span>
          )}
          <span>{post.title}</span>
        </h3>
        <div className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span>Dikirim oleh <strong>{post.profiles?.username || '...'}</strong></span>
            {isAdminPost && (
                <div title={t('admin_verified')}>
                    <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                </div>
            )}
            <span>{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChatBubbleIcon className="w-4 h-4" />
            <span>{post.post_comments[0]?.count ?? 0} {t('comments')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
