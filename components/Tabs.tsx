
import React from 'react';
import { t } from '../utils/i18n';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, CITIES } from '../constants';

interface TabsProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

interface TabConfig {
  id: string;
  label: string;
  requireUser?: boolean;
  requireAdmin?: boolean;
  hideForAdmin?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onNavigate, selectedCategory, setSelectedCategory, selectedCity, setSelectedCity }) => {
  const { currentUser } = useAuth();

  const TABS: TabConfig[] = [
    { id: 'home', label: t('home') },
    { id: 'netizen', label: t('netizen') },
    { id: 'discussion', label: t('discussion_tab') },
    { id: 'favorites', label: t('favorites_tab'), requireUser: true, hideForAdmin: true },
    { id: 'about', label: t('about') },
    { id: 'admin', label: t('admin_tab'), requireAdmin: true }
  ];

  const handleTabClick = (tabId: string) => {
    onNavigate(tabId);
  }

  const visibleTabs = TABS.filter(tab => {
      if (currentUser?.role === 'admin' && tab.hideForAdmin) {
        return false;
      }
      if (tab.requireAdmin) {
          return currentUser?.role === 'admin';
      }
      if (tab.requireUser) {
        return !!currentUser;
      }
      return true;
  })

  return (
    <nav className="border-b border-[var(--color-border)] sticky top-[80px] bg-[var(--color-surface)] z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
            <div className="-mb-px flex space-x-6" aria-label="Tabs">
            {visibleTabs.map((tab) => (
                <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`${
                    activeTab === tab.id
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-t-sm`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                {tab.label}
                </button>
            ))}
            </div>
            {activeTab === 'home' && (
                <div className="hidden md:flex items-center gap-4">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none text-sm"
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
                        className="px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none text-sm"
                        aria-label={t('filter_by_city')}
                        >
                        <option value="All">{t('all_cities')}</option>
                        {CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Tabs;