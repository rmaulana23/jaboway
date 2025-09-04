

import React from 'react';
import { t } from '../../utils/i18n';
import { APP_NAME } from '../../constants';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[var(--color-surface)] p-8 rounded-lg shadow-md border border-[var(--color-border)]">
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{t('about_title')}</h2>
        <div className="space-y-4 text-[var(--color-text-muted)]">
          <p>{t('about_p1')}</p>
          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <p className="text-sm">
              <strong>{APP_NAME}</strong> - {t('about_tagline')}
            </p>
             {/* 
              DEVELOPER NOTE:
              To connect to a backend server or CMS:
              1. Modify `contexts/GuidesContext.tsx` to fetch initial guides from an API instead of `data/guides.ts`.
              2. In `NetizenPage.tsx`, modify `handleSubmit` to post the new guide to your API instead of (or in addition to) `addGuide`.
              3. You might need to add an authentication layer for submissions.
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;