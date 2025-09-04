import React from 'react';
import { APP_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 mt-8 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          Copyright &copy; 2025 - {APP_NAME}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
