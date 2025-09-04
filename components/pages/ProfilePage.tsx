import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { t } from '../../utils/i18n';

interface ProfilePageProps {
    setNotification: (message: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ setNotification }) => {
  const { currentUser, updateUsername, updatePassword } = useAuth();
  
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const [usernameError, setUsernameError] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!currentUser) {
    return null; 
  }

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    if (newUsername.trim() === currentUser.username) {
        return; // No change
    }
    const result = await updateUsername(currentUser.id, newUsername.trim());
    if (result.success) {
        setNotification(t('username_updated_success'));
    } else {
        setUsernameError(t(result.error || ''));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
        setPasswordError(t('password_length_error'));
        return;
    }

    if (newPassword !== confirmNewPassword) {
        setPasswordError(t('error_passwords_no_match'));
        return;
    }

    const result = await updatePassword(currentPassword, newPassword);

    if (result.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setNotification(t('password_updated_success'));
    } else {
        setPasswordError(t(result.error || ''));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('profile_page_title')}</h1>

      <div className="space-y-12">
        {/* Update Username Form */}
        <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-md border border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">{t('update_username')}</h2>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)]">{t('email')}</label>
                <p className="mt-1 text-base">{currentUser.email}</p>
             </div>
             <div>
                <label htmlFor="username" className="block text-sm font-medium">{t('login_username')}</label>
                <input 
                    type="text" 
                    id="username" 
                    value={newUsername} 
                    onChange={e => setNewUsername(e.target.value)} 
                    required 
                    className="mt-1 block w-full md:w-1/2 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)]" 
                />
                {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
             </div>
             <div className="flex justify-start">
                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90">
                    {t('save_username')}
                </button>
             </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-md border border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">{t('profile_update_password_title')}</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
                <label htmlFor="current-password">{t('profile_current_password')}</label>
                <input 
                    type="password" 
                    id="current-password" 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)} 
                    required 
                    className="mt-1 block w-full md:w-1/2 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)]" 
                />
            </div>
             <div>
                <label htmlFor="new-password">{t('profile_new_password')}</label>
                <input 
                    type="password" 
                    id="new-password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                    className="mt-1 block w-full md:w-1/2 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)]" 
                />
             </div>
             <div>
                <label htmlFor="confirm-new-password">{t('profile_confirm_new_password')}</label>
                <input 
                    type="password" 
                    id="confirm-new-password" 
                    value={confirmNewPassword} 
                    onChange={e => setConfirmNewPassword(e.target.value)} 
                    required 
                    className="mt-1 block w-full md:w-1/2 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)]" 
                />
             </div>
             {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
             <div className="flex justify-start">
                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90">
                    {t('profile_save_password_button')}
                </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
