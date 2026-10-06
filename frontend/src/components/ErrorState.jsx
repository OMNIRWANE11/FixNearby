import React from 'react';

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading emergency data.',
  onRetry = null
}) {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'rgba(255, 51, 51, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 51, 51, 0.3)', maxWidth: '520px', margin: '2rem auto' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h3 style={{ fontSize: '1.3rem', color: 'var(--alert-red)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{message}</p>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry}>
          🔄 Retry Request
        </button>
      )}
    </div>
  );
}

export default ErrorState;

