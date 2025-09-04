
import React from 'react';
import { t } from '../utils/i18n';
import { XMarkIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  cancelButtonText
}) => {

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="confirmation-modal-title">
      <div 
        className="bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-lg shadow-xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-[var(--color-border)]">
          <h2 id="confirmation-modal-title" className="text-xl font-bold text-red-500">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-muted)]" aria-label={t('close')}>
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </header>
        <div className="p-6">
          <p className="text-sm text-[var(--color-text-primary)]">{message}</p>
        </div>
        <footer className="p-4 flex justify-end items-center space-x-4 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors"
          >
            {cancelButtonText || t('cancel')}
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {confirmButtonText || t('delete')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;