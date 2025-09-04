
import React from 'react';
import { t } from '../utils/i18n';
import { ExclamationTriangleIcon } from './icons';

interface WarningModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  message: string;
  title?: string;
}

const WarningModal: React.FC<WarningModalProps> = ({ isOpen, onAcknowledge, message, title }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="warning-modal-title">
      <div 
        className="bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-lg shadow-xl w-full max-w-md flex flex-col"
      >
        <header className="p-4 flex flex-col items-center text-center border-b border-[var(--color-border)]">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400 mb-2"/>
          <h2 id="warning-modal-title" className="text-xl font-bold text-yellow-400">{title || t('warning_modal_title')}</h2>
        </header>
        <div className="p-6">
          <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">{message}</p>
        </div>
        <footer className="p-4 flex justify-center items-center bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <button 
            onClick={onAcknowledge} 
            className="w-full px-4 py-2 text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            {t('warning_modal_acknowledged')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default WarningModal;