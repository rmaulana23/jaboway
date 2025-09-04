
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../utils/i18n';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../constants';
import { Theme } from '../types';
import { SunIcon, MoonIcon, UserIcon } from './icons';

interface HeaderProps {
    onLoginClick: () => void;
    onNavigate: (tab: string) => void;
}

export default function Header({ onLoginClick, onNavigate }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-[var(--color-surface)] shadow-md p-4 flex justify-between items-center sticky top-0 z-20 border-b border-[var(--color-border)]">
      <div className="flex items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-primary)] leading-tight">{APP_NAME}</h1>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        {currentUser ? (
             <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)} 
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-[var(--color-border)] transition-colors"
                >
                    <UserIcon className="w-6 h-6"/>
                    <span className="hidden md:inline text-sm font-medium">{currentUser.username}</span>
                </button>
                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg)] rounded-md shadow-lg py-1 border border-[var(--color-border)] z-30">
                        <button
                            onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }}
                            className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                        >
                            {t('profile_tab')}
                        </button>
                        <div className="border-t border-[var(--color-border)] my-1"></div>
                        <button
                            onClick={() => { logout(); setIsProfileOpen(false); }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[var(--color-surface)]"
                        >
                            {t('logout')}
                        </button>
                    </div>
                )}
             </div>
        ) : (
             <div className="flex items-center space-x-2">
                <button 
                  onClick={onLoginClick} 
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity"
                >
                  Login
                </button>
             </div>
        )}

        <div className="h-6 w-px bg-[var(--color-border)]"></div>
        
        <div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-[var(--color-border)] transition-colors"
            aria-label={t('theme')}
          >
            {theme === Theme.Light ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
}