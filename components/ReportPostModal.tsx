
import React, { useState } from 'react';
import { useDiscussion } from '../contexts/DiscussionContext';
import { t } from '../utils/i18n';
import { Post } from '../types';
import { XMarkIcon } from './icons';

interface ReportPostModalProps {
  post: Post;
  onClose: () => void;
  onSuccess: () => void;
}

const ReportPostModal: React.FC<ReportPostModalProps> = ({ post, onClose, onSuccess }) => {
  const { reportPost } = useDiscussion();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan tidak boleh kosong.');
      return;
    }
    reportPost(post.id, reason.trim());
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-lg shadow-xl w-full max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">{t('report_modal_title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-muted)]" aria-label={t('close')}>
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm p-3 bg-gray-800 rounded-md border border-gray-700">
            Anda melaporkan postingan: <strong className="font-semibold text-white">"{post.title}"</strong>
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label htmlFor="report-reason" className="block text-sm font-medium">{t('report_reason_label')}</label>
            <textarea 
                id="report-reason" 
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                required 
                rows={4} 
                className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" 
                placeholder={t('report_reason_placeholder')}
            ></textarea>
          </div>
          <div className="flex justify-end pt-4 gap-2">
            <button type="button" onClick={onClose} className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-[var(--color-border)] shadow-sm text-sm font-medium rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-border)]">
                {t('cancel')}
            </button>
            <button type="submit" className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                {t('report_submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportPostModal;