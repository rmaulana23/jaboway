import React from 'react';
// FIX: Correct the type import from `Verification` to `PostVerification`.
import { PostVerification } from '../types';
import { t } from '../utils/i18n';

interface VerificationStatusDisplayProps {
  // FIX: Use the correct type `PostVerification`.
  verifications: PostVerification[] | undefined;
}

const VerificationStatusDisplay: React.FC<VerificationStatusDisplayProps> = ({ verifications }) => {
  if (!verifications || verifications.length === 0) {
    return null;
  }
  
  const questionableVotes = verifications.filter(v => v.status === 'questionable').length;
  const trueVotes = verifications.filter(v => v.status === 'true').length;

  if (questionableVotes > 0) {
    return (
      <span title={t('verified_doubtful')}>
        <span className="text-lg" aria-label="Unverified">🟡</span>
      </span>
    );
  }

  if (trueVotes > 0) {
    return (
      <span title={t('verified_true')}>
        <span className="text-lg" aria-label="Verified">🟢</span>
      </span>
    );
  }

  return null;
};

export default VerificationStatusDisplay;