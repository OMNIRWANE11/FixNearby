import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTelLink, getWhatsAppLink } from '../utils/contactLinks';
import RatingStars from './RatingStars';
import VerificationCheck from './VerificationCheck';

export function TechnicianProfile({ technician, onClose, onRequestHelp }) {
  const navigate = useNavigate();
  if (!technician) return null;

  const whatsappUrl = getWhatsAppLink(technician.whatsappNumber || technician.phone, {
    category: technician.trade,
    problem: 'Emergency service request',
    requestId: 'PROFILE-CALL'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Profile">
          ✕
        </button>

        {/* Header Profile Section */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <img
            src={technician.profileImageUrl || '/images/technicians/tech-default.svg'}
            alt={technician.name}
            style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-aqua)' }}
          />
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{technician.name}</h2>
              {technician.isVerified && (
                <span className="badge-tag badge-verified">🛡️ 4-Point Verified</span>
              )}
            </div>
            <p style={{ color: 'var(--accent-aqua)', fontWeight: 600, fontSize: '0.95rem' }}>{technician.trade}</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.85rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{technician.badgeCode}</span>
              <span style={{ color: 'var(--text-muted)' }}>• {technician.experienceYears} Years Exp</span>
              <span style={{ color: technician.isOnDuty ? 'var(--accent-aqua)' : 'var(--text-muted)' }}>
                • {technician.isOnDuty ? 'Online / On Duty' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Trust Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem', background: 'var(--surface-2)', padding: '1rem', borderRadius: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trust Rating</div>
            <RatingStars rating={technician.rating} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed Jobs</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{technician.jobsCompleted || 0}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Coverage Radius</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>{technician.operatingRadiusKm} km</div>
          </div>
        </div>

        {/* Verification Checks Details */}
        {technician.verificationAudit && technician.verificationAudit.checks && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>4-Point Safety Verification Audit</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {Object.entries(technician.verificationAudit.checks).map(([key, check]) => (
                <div
                  key={key}
                  style={{
                    padding: '0.6rem 0.8rem',
                    background: 'var(--surface-2)',
                    borderRadius: '6px',
                    borderLeft: check.passed ? '3px solid var(--accent-aqua)' : '3px solid var(--alert-red)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{check.title}</span>
                    <span style={{ color: check.passed ? 'var(--accent-aqua)' : 'var(--alert-red)' }}>
                      {check.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {check.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {technician.specialties && technician.specialties.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Core Technical Specialties</h4>
            <div className="card-tags">
              {technician.specialties.map((spec, i) => (
                <span key={i} className="card-tag" style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}>
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <a href={getTelLink(technician.phone)} className="btn-primary" style={{ textDecoration: 'none' }}>
            📞 Direct Call
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>
            💬 WhatsApp
          </a>
          <button
            className="btn-outline"
            onClick={() => {
              onClose();
              navigate(`/verify?code=${technician.badgeCode}`);
            }}
          >
            🛡️ Verify Badge Page
          </button>
          <button
            className="btn-sos"
            onClick={() => {
              onClose();
              if (onRequestHelp) onRequestHelp(technician);
              else navigate(`/emergency?category=${technician.trade.toLowerCase()}`);
            }}
          >
            🚨 Request Immediate Help
          </button>
        </div>
      </div>
    </div>
  );
}

export default TechnicianProfile;

