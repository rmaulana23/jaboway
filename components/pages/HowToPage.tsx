

import React, { useState, useMemo } from 'react';
import { Guide } from '../../types';
import { useGuides } from '../../contexts/GuidesContext';
import { t } from '../../utils/i18n';
import { CATEGORIES, CITIES } from '../../constants';
import GuideCard from '../GuideCard';

interface HowToPageProps {
  onGuideSelect: (guide: Guide) => void;
}

const HowToPage: React.FC<HowToPageProps> = ({ onGuideSelect }) => {
  const { approvedGuides: guides } = useGuides();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
      const matchesCity = selectedCity === 'All' || guide.city === selectedCity;
      const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesCity && matchesSearch;
    });
  }, [guides, searchTerm, selectedCategory, selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder={t('search_guides')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          aria-label={t('filter_by_category')}
        >
          <option value="All">{t('all_categories')}</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          aria-label={t('filter_by_city')}
        >
          <option value="All">{t('all_cities')}</option>
          {CITIES.map(city => (
             <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map(guide => (
            <GuideCard key={guide.id} guide={guide} onSelect={onGuideSelect} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[var(--color-text-muted)]">{t('no_guides_found')}</p>
        </div>
      )}
    </div>
  );
};

export default HowToPage;