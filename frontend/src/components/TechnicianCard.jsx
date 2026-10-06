import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTelLink, getWhatsAppLink } from '../utils/contactLinks';
import { formatDistance, formatEta } from '../utils/formatters';
import RatingStars from './RatingStars';

export function TechnicianCard({ technician, onSelect, onOpenProfile }) {
  const navigate = useNavigate();

  if (!technician) return null;

  const handleCardClick = () => {
    if (onOpenProfile) {
      onOpenProfile(technician);
    }
  };

  const whatsappUrl = getWhatsAppLink(technician.whatsappNumber || technician.phone, {
    category: technician.trade,
    problem: 'Emergency technician inquiry',
    requestId: 'INQUIRY'
  });

  return (
    <article
      className="tech-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Technician ${technician.name}, ${technician.trade}`}
    >
      {/* Top Header */}
      <div className="tech-card-header">
        <img
          src={technician.profileImageUrl || '/images/technicians/tech-default.svg'}
          alt={`${technician.name} profile portrait`}
          className="tech-avatar"
          loading="lazy"
        />
        <div className="tech-meta" style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3>{technician.name}</h3>
            {technician.isVerified ? (
              <span className="badge-tag badge-verified" title="Passed 4-Point Credential Audit">
                🛡️ Verified
              </span>
            ) : (
              <span className="badge-tag badge-warning" title="Pending Verification">
                Pending Audit
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{technician.trade}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span className="tech-badge-id">{technician.badgeCode}</span>
            <span style={{ fontSize: '0.8rem', color: technician.isOnDuty ? 'var(--accent-aqua)' : 'var(--text-muted)' }}>
              • {technician.isOnDuty ? '🟢 On Duty' : '⚪ Off Duty'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="tech-stats-row">
        <div>
          <div className="tech-stat-label">Rating</div>
          <div className="tech-stat-val">
            <RatingStars rating={technician.rating} />
          </div>
        </div>
        <div>
          <div className="tech-stat-label">Distance</div>
          <div className="tech-stat-val" style={{ color: 'var(--accent-aqua)' }}>
            {formatDistance(technician.distanceKm)}
          </div>
        </div>
        <div>
          <div className="tech-stat-label">Est. Arrival</div>
          <div className="tech-stat-val">
            {formatEta(technician.etaMinutes)}
          </div>
        </div>
      </div>

      {/* Specialties Tags */}
      {technician.specialties && technician.specialties.length > 0 && (
        <div className="card-tags" style={{ margin: 0 }}>
          {technician.specialties.slice(0, 3).map((spec, i) => (
            <span key={i} className="card-tag">{spec}</span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="tech-action-buttons" onClick={(e) => e.stopPropagation()}>
        <a
          href={getTelLink(technician.phone)}
          className="btn-primary"
          style={{ fontSize: '0.85rem', textDecoration: 'none' }}
          aria-label={`Call technician ${technician.name}`}
        >
          📞 Call Direct
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ fontSize: '0.85rem', textDecoration: 'none' }}
          aria-label={`WhatsApp message technician ${technician.name}`}
        >
          💬 WhatsApp
        </a>
        <button
          className="btn-outline tech-full-width-action"
          style={{ minHeight: '38px', fontSize: '0.85rem' }}
          onClick={() => navigate(`/verify?code=${technician.badgeCode}`)}
        >
          🔍 Verify Badge ({technician.badgeCode})
        </button>
        {onSelect && (
          <button
            className="btn-sos tech-full-width-action"
            style={{ minHeight: '44px', fontSize: '0.95rem' }}
            onClick={() => onSelect(technician)}
          >
            Select For Emergency SOS ➔
          </button>
        )}
      </div>
    </article>
  );
}

export default TechnicianCard;

