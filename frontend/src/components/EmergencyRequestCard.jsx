import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateTime, formatDistance } from '../utils/formatters';

export function EmergencyRequestCard({ request }) {
  const navigate = useNavigate();
  if (!request) return null;

  const isCompleted = request.status === 'COMPLETED';
  const isCancelled = request.status === 'CANCELLED';

  return (
    <div className="emergency-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/tracking/${request.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <span className="badge-tag" style={{ background: request.severity === 'CRITICAL' ? 'var(--alert-red-dim)' : 'var(--warning-dim)', color: request.severity === 'CRITICAL' ? 'var(--alert-red)' : 'var(--warning)' }}>
            {request.severity}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            {formatDateTime(request.createdAt)}
          </span>
        </div>
        <span className={`badge-tag ${isCompleted ? 'badge-verified' : isCancelled ? 'badge-unverified' : 'badge-warning'}`}>
          {request.status.replace(/_/g, ' ')}
        </span>
      </div>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
        {request.problemName || request.categoryName || 'Emergency Service'}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
        📍 {request.customerAddress || 'Kolhapur area'}
      </p>

      {request.technician && (
        <div style={{ background: 'var(--surface-2)', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <strong>{request.technician.name}</strong> ({request.technician.trade})
          </div>
          <span style={{ fontFamily: 'monospace', color: 'var(--accent-aqua)' }}>
            {request.technician.badgeCode}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)' }}>
          {request.distanceKm ? `${formatDistance(request.distanceKm)} distance` : 'View Dispatch Track'}
        </span>
        <button className="btn-secondary" style={{ minHeight: '36px', fontSize: '0.85rem', padding: '0 0.75rem' }}>
          View Tracking ➔
        </button>
      </div>
    </div>
  );
}

export default EmergencyRequestCard;

