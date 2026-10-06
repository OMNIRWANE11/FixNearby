import React from 'react';

export function EmptyState({
  title = 'No technicians found nearby',
  description = 'Try widening your search radius or adjusting category filters.',
  actionLabel = null,
  onAction = null,
  icon = '🔍'
}) {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--surface-1)', borderRadius: '16px', border: '1px solid var(--border)', maxWidth: '520px', margin: '2rem auto' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{description}</p>
      {actionLabel && onAction && (
        <button className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

