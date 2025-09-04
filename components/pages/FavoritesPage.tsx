import React from 'react';
import { Guide } from '../../types';
import { useGuides } from '../../contexts/GuidesContext';
import { t } from '../../utils/i18n';
import GuideCard from '../GuideCard';

interface FavoritesPageProps {
  onGuideSelect: (guide: Guide) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ onGuideSelect }) => {
  const { favoriteGuides } = useGuides();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold mb-8">{t('favorites_tab')}</h2>
      
      {favoriteGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteGuides.map(guide => (
            <GuideCard key={guide.id} guide={guide} onSelect={onGuideSelect} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--color-surface)] rounded-lg border border-dashed border-[var(--color-border)]">
          <p className="text-[var(--color-text-muted)]">{t('no_favorites_found')}</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
