import React, { useState, useMemo } from 'react';
import { Guide, Post } from '../../types';
import { useGuides } from '../../contexts/GuidesContext';
import { useDiscussion } from '../../contexts/DiscussionContext';
import { t } from '../../utils/i18n';
import GuideCard from '../GuideCard';
import PostCard from '../PostCard';

interface StoryPageProps {
  onGuideSelect: (guide: Guide) => void;
  selectedCategory: string;
  selectedCity: string;
  onPostSelect: (post: Post) => void;
  onNavigate: (tab: string) => void;
  onEditRequest: (post: Post) => void;
}

const StoryPage: React.FC<StoryPageProps> = ({ onGuideSelect, selectedCategory, selectedCity, onPostSelect, onNavigate, onEditRequest }) => {
  const { approvedGuides } = useGuides();
  const { posts } = useDiscussion();
  const [searchTerm, setSearchTerm] = useState('');

  const latestPosts = useMemo(() => {
    return [...posts]
        // FIX: Correct property name from `createdAt` to `created_at` for sorting.
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 2);
  }, [posts]);

  const filteredGuides = useMemo(() => {
    const filtered = approvedGuides.filter(guide => {
      const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
      const matchesCity = selectedCity === 'All' || guide.city === selectedCity;
      const matchesSearch = searchTerm === '' ? true : 
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guide.tags && guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesCategory && matchesCity && matchesSearch;
    });
    
    return filtered.sort((a, b) => a.title.localeCompare(b.title));

  }, [approvedGuides, searchTerm, selectedCategory, selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary)] mb-4">
              {t('homepage_title')}
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-[var(--color-text-muted)]">
              {t('homepage_description')}
          </p>
      </div>
      
      {latestPosts.length > 0 && (
        <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{t('latest_discussions_title')}</h2>
                <button
                    onClick={() => onNavigate('discussion')}
                    className="px-4 py-2 text-sm font-medium rounded-md text-[var(--color-primary)] hover:bg-[var(--color-border)] transition-colors"
                >
                    {t('view_all_discussions')}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestPosts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onSelect={() => onPostSelect(post)}
                        onDeleteRequest={() => {}}
                        onEditRequest={() => onEditRequest(post)}
                        showAdminControls={false}
                    />
                ))}
            </div>
        </section>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t('guides_section_title')}</h2>
        <button
            onClick={() => onNavigate('netizen-submit')}
            className="hidden md:inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity"
        >
            {t('submit_your_guide')}
        </button>
      </div>
      
      <div className="mb-8">
        <input
          type="text"
          placeholder={t('search_guides')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
        />
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

export default StoryPage;
