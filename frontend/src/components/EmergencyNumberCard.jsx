import React from 'react';

export function EmergencyNumberCard({ service, number, description, icon = '🚨', color = 'var(--accent-aqua)' }) {
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>{icon}</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.15rem' }}>{service}</h4>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color, fontFamily: 'monospace' }}>
              {number}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
      </div>

      <a
        href={`tel:${number}`}
        className="btn-sos"
        style={{ textDecoration: 'none', minHeight: '42px', padding: '0 1.25rem', fontSize: '0.9rem' }}
        aria-label={`Dial ${service} hotline at ${number}`}
      >
        📞 Call {number}
      </a>
    </div>
  );
}

export default EmergencyNumberCard;

