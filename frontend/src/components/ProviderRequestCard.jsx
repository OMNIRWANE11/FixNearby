import React from 'react';
import { formatDateTime, formatDistance } from '../utils/formatters';
import { getTelLink } from '../utils/contactLinks';

export function ProviderRequestCard({ request, onRespond, type = 'pending' }) {
  if (!request) return null;

  const isCritical = request.severity === 'CRITICAL';

  return (
    <div
      className="tech-card"
      style={{
        borderLeft: isCritical ? '4px solid var(--alert-red)' : '4px solid var(--warning)',
        background: isCritical ? 'rgba(255, 51, 51, 0.04)' : 'var(--surface-1)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          className="badge-tag"
          style={{
            background: isCritical ? 'var(--alert-red-dim)' : 'var(--warning-dim)',
            color: isCritical ? 'var(--alert-red)' : 'var(--warning)',
            fontWeight: 800
          }}
        >
          {request.severity} PRIORITY
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {formatDateTime(request.createdAt)}
        </span>
      </div>

      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
          {request.problemName || 'Emergency Service Call'}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Customer: <strong>{request.customerName}</strong> ({request.customerPhone})
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          📍 {request.customerAddress}
        </p>
      </div>

      {request.distanceKm && (
        <div style={{ background: 'var(--surface-2)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
          Straight-line distance: <strong style={{ color: 'var(--accent-aqua)' }}>{formatDistance(request.distanceKm)}</strong>
        </div>
      )}

      {/* Action Buttons */}
      {type === 'pending' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button className="btn-primary" onClick={() => onRespond(request.id, 'accept')}>
            ACCEPT DISPATCH ✓
          </button>
          <button className="btn-secondary" onClick={() => onRespond(request.id, 'decline')}>
            Decline
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <a href={getTelLink(request.customerPhone)} className="btn-secondary" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>
              📞 Call Citizen
            </a>
            {request.status === 'ASSIGNED' && (
              <button className="btn-primary" onClick={() => onRespond(request.id, 'on_the_way')}>
                🚗 Mark On The Way
              </button>
            )}
            {request.status === 'ON_THE_WAY' && (
              <button className="btn-primary" onClick={() => onRespond(request.id, 'arrived')}>
                📍 Mark Arrived
              </button>
            )}
            {request.status === 'ARRIVED' && (
              <button className="btn-primary" onClick={() => onRespond(request.id, 'complete')}>
                ✅ Mark Completed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderRequestCard;

