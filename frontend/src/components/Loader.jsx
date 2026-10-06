import React from 'react';

export function Loader({ label = 'Connecting emergency services...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1rem' }}>
      <div className="loader-spinner"></div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{label}</p>
    </div>
  );
}

export default Loader;

