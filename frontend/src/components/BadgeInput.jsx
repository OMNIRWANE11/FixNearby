import React, { useState } from 'react';
import { formatBadgeInput, isValidBadgeCode } from '../utils/badgeValidator';

export function BadgeInput({ onVerify, initialValue = '', loading = false }) {
  const [badgeCode, setBadgeCode] = useState(initialValue || '');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const formatted = formatBadgeInput(e.target.value);
    setBadgeCode(formatted);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = badgeCode.trim().toUpperCase();
    if (!isValidBadgeCode(clean)) {
      setError('Please enter a valid badge code in format FN-XXXXX (e.g., FN-88492).');
      return;
    }
    setError('');
    if (onVerify) {
      onVerify(clean);
    }
  };

  const handleUseExample = (code) => {
    setBadgeCode(code);
    setError('');
    if (onVerify) {
      onVerify(code);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleSubmit} className="badge-input-form">
        <input
          type="text"
          value={badgeCode}
          onChange={handleChange}
          placeholder="FN-XXXXX"
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck="false"
          aria-label="Technician Badge Code"
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Verifying...' : 'VERIFY BADGE ➔'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'var(--alert-red)', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Quick Example Badges */}
      <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
        <span>Try Demo Badges:</span>
        <button
          type="button"
          onClick={() => handleUseExample('FN-88492')}
          style={{ background: 'transparent', color: 'var(--accent-aqua)', padding: 0, minHeight: 'auto', textDecoration: 'underline' }}
        >
          FN-88492 (Verified)
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => handleUseExample('FN-33211')}
          style={{ background: 'transparent', color: 'var(--alert-red)', padding: 0, minHeight: 'auto', textDecoration: 'underline' }}
        >
          FN-33211 (Audit Fail)
        </button>
      </div>
    </div>
  );
}

export default BadgeInput;

