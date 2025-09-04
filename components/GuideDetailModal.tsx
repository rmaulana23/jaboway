import React, { useState, useEffect, useCallback } from 'react';
import { Guide } from '../types';
import { t } from '../utils/i18n';
import { useGuides } from '../contexts/GuidesContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { BookmarkIcon, ShareIcon, ClipboardIcon, XMarkIcon } from './icons';

interface GuideDetailModalProps {
  guide: Guide;
  onClose: () => void;
}

const GuideDetailModal: React.FC<GuideDetailModalProps> = ({ guide, onClose }) => {
  const { toggleFavorite, isFavorite, incrementGuideView } = useGuides();
  const { currentUser } = useAuth();
  const [progress, setProgress] = useLocalStorage<boolean[]>(`progress-${guide.id}`, []);
  const [showToast, setShowToast] = useState<string | null>(null);
  
  const isSaved = isFavorite(guide.id);

  useEffect(() => {
    // Increment the view count only once when the modal is opened
    incrementGuideView(guide.id);
  }, [guide.id, incrementGuideView]);


  useEffect(() => {
    if (progress.length !== guide.steps.length) {
      setProgress(new Array(guide.steps.length).fill(false));
    }
  }, [guide.steps.length, progress.length, setProgress]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleCheckboxChange = (index: number) => {
    const newProgress = [...progress];
    newProgress[index] = !newProgress[index];
    setProgress(newProgress);
  };

  const getGuideContentAsString = useCallback(() => {
    let content = `${guide.title}\n\n`;
    content += `${t('steps')}:\n`;
    guide.steps.forEach((step, index) => {
      content += `${index + 1}. ${step}\n`;
    });
    // FIX: Add a null check for guide.tips before accessing its length.
    if (guide.tips && guide.tips.length > 0) {
      content += `\n${t('tips')}:\n`;
      guide.tips.forEach((tip) => {
        content += `- ${tip}\n`;
      });
    }
    return content;
  }, [guide]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getGuideContentAsString());
      handleToast(t('guide_copied'));
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: guide.title,
      text: getGuideContentAsString(),
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        handleCopy();
        handleToast(t('guide_copied')); // more accurate message for fallback
      }
    } catch (err) {
      console.error('Error sharing', err);
      handleToast(t('share_error'));
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg)] z-10">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">{guide.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-muted)]" aria-label={t('close')}>
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </header>

        <div className="overflow-y-auto p-6 space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3">{t('steps')}</h3>
            <ul className="space-y-3">
              {guide.steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <input
                    type="checkbox"
                    id={`step-${index}`}
                    checked={progress[index] || false}
                    onChange={() => handleCheckboxChange(index)}
                    className="h-5 w-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] mt-0.5"
                  />
                  <label htmlFor={`step-${index}`} className={`ml-3 text-[var(--color-text-primary)] ${progress[index] ? 'line-through text-[var(--color-text-muted)]' : ''}`}>
                    {step}
                  </label>
                </li>
              ))}
            </ul>
          </section>

          {/* FIX: Add a null check for guide.tips before accessing its length. */}
          {guide.tips && guide.tips.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-3">{t('tips')}</h3>
              <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)] space-y-2">
                {guide.tips.map((tip, index) => (
                  <p key={index} className="text-sm text-[var(--color-text-muted)]">💡 {tip}</p>
                ))}
              </div>
            </section>
          )}

          {/* FIX: Check if guide.links is not null and has items before rendering. */}
          {guide.links && (guide.links as any[]).length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-3">{t('links')}</h3>
              <ul className="space-y-2">
                {/* FIX: Cast guide.links to the expected array type to map over it. */}
                {(guide.links as { title: string; url: string }[]).map((link, index) => (
                  <li key={index}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        
        <footer className="p-4 flex justify-end items-center space-x-2 border-t border-[var(--color-border)] bg-[var(--color-bg)] sticky bottom-0">
            {currentUser?.role !== 'admin' && (
              <button onClick={() => toggleFavorite(guide.id)} className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${isSaved ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] hover:bg-[var(--color-border)]'}`} aria-label={isSaved ? t('saved') : t('save')}>
                  <BookmarkIcon className="w-5 h-5"/>
                  <span>{isSaved ? t('saved') : t('save')}</span>
              </button>
            )}
            <button onClick={handleShare} className="flex items-center space-x-2 px-4 py-2 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-border)] transition-colors text-sm font-medium" aria-label={t('share')}>
                <ShareIcon className="w-5 h-5"/>
                <span>{t('share')}</span>
            </button>
            <button onClick={handleCopy} className="flex items-center space-x-2 px-4 py-2 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-border)] transition-colors text-sm font-medium" aria-label={t('copy_all')}>
                <ClipboardIcon className="w-5 h-5"/>
                <span>{t('copy_all')}</span>
            </button>
        </footer>

        {showToast && (
          <div className="absolute bottom-20 right-1/2 translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm animate-pulse">
            {showToast}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideDetailModal;
