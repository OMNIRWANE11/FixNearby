import React from 'react';

export function SafetyAlert({ instructions, type = 'critical' }) {
  if (!instructions) return null;

  return (
    <div
      className={`safety-alert ${type === 'warning' ? 'warning' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <div style={{ fontSize: '1.4rem' }}>
        {type === 'warning' ? '⚠️' : '🚨'}
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Immediate Crisis Safety Instruction
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {instructions}
        </p>
      </div>
    </div>
  );
}

export default SafetyAlert;

