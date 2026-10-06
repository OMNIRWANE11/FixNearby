import React from 'react';

export function VerificationBadge({ isVerified, size = 'normal', showText = true }) {
  if (!isVerified) {
    return (
      <span className="badge-tag badge-warning" title="Credentials pending full 4-point verification audit">
        ⚠️ {showText && 'Unverified'}
      </span>
    );
  }

  return (
    <span className="badge-tag badge-verified" title="FixNearby 4-Point Verified Technician">
      🛡️ {showText && '4-Point Verified'}
    </span>
  );
}

export default VerificationBadge;

