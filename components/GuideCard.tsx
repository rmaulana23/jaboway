import React from 'react';
import { Guide } from '../types';
import { t } from '../utils/i18n';
import { useGuides } from '../contexts/GuidesContext';
import { useAuth } from '../contexts/AuthContext';
import { BookmarkIcon, EyeIcon } from './icons';

interface GuideCardProps {
  guide: Guide;
  onSelect: (guide: Guide) => void;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide, onSelect }) => {
  const { toggleFavorite, isFavorite } = useGuides();
  const { currentUser } = useAuth();
  const isSaved = isFavorite(guide.id);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(guide.id);
  };
  
  return (
    <div
      onClick={() => onSelect(guide)}
      className="bg-[var(--color-surface)] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col justify-between border border-[var(--color-border)] h-full"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(guide)}
    >
      <div className="p-4">
        <h3 className="font-bold text-lg text-[var(--color-primary)]">{guide.title}</h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{guide.steps[0]}</p>
        {/* FIX: Use `guide.profiles.username` instead of non-existent `guide.author`. */}
        {guide.profiles?.username && guide.profiles.username !== 'Admin' && (
          <p className="text-xs text-[var(--color-text-muted)] mt-2 italic">{t('submitted_by')} <strong>{guide.profiles.username}</strong></p>
        )}
      </div>
      <div className="px-4 pt-2 pb-4 flex justify-between items-center border-t border-[var(--color-border)]">
        <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center space-x-1 text-xs text-[var(--color-text-muted)]">
                <EyeIcon className="w-4 h-4"/>
                <span>{guide.views || 0} {t('views')}</span>
            </div>
            {/* FIX: Add optional chaining for tags that can be null. */}
            {guide.tags?.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs text-[var(--color-primary)] opacity-80">#{tag}</span>
            ))}
        </div>
        {currentUser?.role !== 'admin' && (
          <button
            onClick={handleSaveClick}
            className={`p-2 rounded-full hover:bg-[var(--color-border)] transition-colors ${isSaved ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
            aria-label={isSaved ? t('saved') : t('save')}
          >
            <BookmarkIcon className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
};

export default GuideCard;
