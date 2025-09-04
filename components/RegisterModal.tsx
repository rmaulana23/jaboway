
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../utils/i18n';
import { XMarkIcon } from './icons';

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSwitchToLogin, onRegisterSuccess }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // FIX: Make handleSubmit async to await the register promise.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if(password.length < 6) {
        setError(t('password_length_error'));
        return;
    }
    // FIX: Await the result of the register function.
    const result = await register(username, password, email);
    if (result.success) {
      onRegisterSuccess();
      onClose();
    } else {
      setError(t(result.error || 'registration_failed_error'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-lg shadow-xl w-full max-w-sm flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">{t('register_modal_title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-muted)]" aria-label="Close">
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label htmlFor="reg-username" className="block text-sm font-medium">{t('register_username')}</label>
            <input type="text" id="reg-username" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium">{t('email')}</label>
            <input type="email" id="reg-email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium">{t('register_password')}</label>
            <input type="password" id="reg-password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" />
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]">
            {t('register_button')}
          </button>
           <p className="text-sm text-center text-[var(--color-text-muted)]">
            {t('register_prompt')}{' '}
            <button type="button" onClick={onSwitchToLogin} className="font-medium text-[var(--color-primary)] hover:underline">
              {t('register_login_link')}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;