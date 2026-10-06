import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTelLink, getWhatsAppLink } from '../utils/contactLinks';
import { formatDistance, formatEta } from '../utils/formatters';
import StatusTimeline from './StatusTimeline';
import RatingStars from './RatingStars';

export function TrackingPanel({ trackingData, onCancelRequest, onCompleteReview, fallbackNotice }) {
  const navigate = useNavigate();
  if (!trackingData) return null;

  const { technician, status, distanceRemainingKm, etaMinutes, requestId, problem, severity } = trackingData;

  const whatsappUrl = technician ? getWhatsAppLink(technician.phone, {
    category: technician.trade,
    problem: problem || 'Emergency dispatch',
    requestId: requestId
  }) : '#';

  return (
    <div className="tracking-sidebar">
      {/* Live Status Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge-tag" style={{ background: severity === 'CRITICAL' ? 'var(--alert-red-dim)' : 'var(--warning-dim)', color: severity === 'CRITICAL' ? 'var(--alert-red)' : 'var(--warning)' }}>
            {severity} EMERGENCY
          </span>
          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            #{requestId.slice(0, 8)}
          </span>
        </div>
        <h2 style={{ fontSize: '1.4rem', marginTop: '0.5rem', marginBottom: '0.2rem' }}>
          {problem || 'Emergency Assistance'}
        </h2>
      </div>

      {/* Live ETA Box */}
      <div className="tracking-eta-badge">
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {status === 'ARRIVED' ? 'TECHNICIAN ARRIVED' : 'ESTIMATED ARRIVAL TIME'}
        </div>
        <div className="tracking-eta-time">
          {status === 'ARRIVED' ? 'AT YOUR DOOR' : formatEta(etaMinutes)}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {status === 'ARRIVED' ? 'Ready for entry verification' : `${formatDistance(distanceRemainingKm)} remaining`}
        </div>
      </div>

      {/* Fallback Notice */}
      {fallbackNotice && (
        <div style={{ fontSize: '0.8rem', color: 'var(--warning)', background: 'var(--warning-dim)', padding: '0.5rem', borderRadius: '4px' }}>
          ℹ️ {fallbackNotice}
        </div>
      )}

      {/* Status Timeline */}
      <StatusTimeline currentStatus={status} />

      {/* Assigned Technician Card */}
      {technician ? (
        <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <img
              src={technician.profileImageUrl || '/images/technicians/tech-default.svg'}
              alt={technician.name}
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-aqua)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{technician.name}</h3>
                {technician.isVerified && <span title="Verified">🛡️</span>}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', margin: 0 }}>{technician.trade}</p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Badge: <strong style={{ color: 'var(--text-primary)' }}>{technician.badgeCode}</strong>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <RatingStars rating={technician.rating} count={technician.jobsCompleted} />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <a href={getTelLink(technician.phone)} className="btn-primary" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>
              📞 Call Direct
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>
              💬 WhatsApp
            </a>
            <button
              className="btn-outline"
              style={{ gridColumn: 'span 2', minHeight: '38px', fontSize: '0.85rem' }}
              onClick={() => navigate(`/verify?code=${technician.badgeCode}`)}
            >
              🛡️ Verify Technician Badge
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface-2)', borderRadius: '10px' }}>
          <p>Matching closest available technician in Kolhapur...</p>
        </div>
      )}

      {/* Review / Cancel Actions */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {status === 'ARRIVED' || status === 'COMPLETED' ? (
          <button className="btn-primary" onClick={onCompleteReview}>
            ⭐ Leave Review & Complete Job
          </button>
        ) : (
          <button
            className="btn-secondary"
            style={{ color: 'var(--alert-red)', borderColor: 'rgba(255,51,51,0.3)' }}
            onClick={onCancelRequest}
          >
            Cancel Emergency Request
          </button>
        )}
      </div>
    </div>
  );
}

export default TrackingPanel;

