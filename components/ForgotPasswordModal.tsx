
import React, { useState } from 'react';
import { t } from '../utils/i18n';
import { XMarkIcon } from './icons';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would call an API to send a reset link.
    // For this demo, we just show a confirmation message for security.
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-lg shadow-xl w-full max-w-sm flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">{t('forgot_password_modal_title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-muted)]" aria-label={t('close')}>
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </header>
        {submitted ? (
           <div className="p-6 text-center space-y-4">
              <p className="text-sm">{t('forgot_password_success')}</p>
              <button onClick={onSwitchToLogin} className="font-medium text-[var(--color-primary)] hover:underline">
                  {t('back_to_login_link')}
              </button>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-gray-400">{t('forgot_password_instructions')}</p>
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium">{t('forgot_password_email_label')}</label>
              <input 
                type="email" 
                id="forgot-email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)]" 
              />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:opacity-90">
              {t('forgot_password_button')}
            </button>
            <p className="text-sm text-center">
              <button type="button" onClick={onSwitchToLogin} className="font-medium text-[var(--color-primary)] hover:underline">
                {t('back_to_login_link')}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
