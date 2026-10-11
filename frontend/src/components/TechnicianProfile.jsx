import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTelLink, getWhatsAppLink } from '../utils/contactLinks';
import RatingStars from './RatingStars';
import VerificationCheck from './VerificationCheck';
import api from '../services/api';

export function TechnicianProfile({ technician, onClose, onRequestHelp, onSelect, actionButtonLabel }) {
  const navigate = useNavigate();
  if (!technician) return null;

  const [profileData, setProfileData] = useState(technician);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    setProfileData(technician);
    if (technician?.id) {
      setLoadingDetails(true);
      api.technicians.getById(technician.id)
        .then((res) => {
          if (res.success && res.data) {
            setProfileData((prev) => ({ ...prev, ...res.data }));
          }
        })
        .catch(console.error)
        .finally(() => setLoadingDetails(false));
    }
  }, [technician]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const whatsappUrl = getWhatsAppLink(profileData.whatsappNumber || profileData.phone, {
    category: profileData.trade,
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
            src={profileData.profileImageUrl || '/images/technicians/tech-default.svg'}
            alt={profileData.name}
            style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-aqua)' }}
          />
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{profileData.name}</h2>
              {profileData.isVerified && (
                <span className="badge-tag badge-verified">🛡️ 4-Point Verified</span>
              )}
            </div>
            <p style={{ color: 'var(--accent-aqua)', fontWeight: 600, fontSize: '0.95rem' }}>{profileData.trade}</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.85rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{profileData.badgeCode}</span>
              <span style={{ color: 'var(--text-muted)' }}>• {profileData.experienceYears || 1} Years Exp</span>
              <span style={{ color: profileData.isBusy ? 'var(--warning)' : profileData.isOnDuty ? 'var(--accent-aqua)' : 'var(--text-muted)' }}>
                • {profileData.isBusy ? '🟡 Busy / Assigned' : profileData.isOnDuty ? '🟢 Online / On Duty' : '⚪ Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Trust Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem', background: 'var(--surface-2)', padding: '1rem', borderRadius: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trust Rating</div>
            <RatingStars rating={profileData.rating} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed Jobs</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{profileData.jobsCompleted || 0}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Coverage Radius</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>{profileData.operatingRadiusKm || 15} km</div>
          </div>
        </div>

        {/* Professional & Business Details */}
        <div style={{ marginBottom: '1.5rem', background: 'var(--surface-2)', padding: '1rem', borderRadius: '10px' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>Professional & Business Profile</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>License Number</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{profileData.licenseNumber ? '****' + profileData.licenseNumber.slice(-4) : 'Verified by FixNearby Admin'}</span>
            </div>
            {profileData.educationDegree && (
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Education / Degree</span>
                <span>{profileData.educationDegree}</span>
              </div>
            )}
            {profileData.shopName && (
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Shop / Business Name</span>
                <span>{profileData.shopName}</span>
              </div>
            )}
            {profileData.shopContact && (
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Shop Contact</span>
                <span>{profileData.shopContact}</span>
              </div>
            )}
            {profileData.certifications && (
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Certifications</span>
                <span>{profileData.certifications}</span>
              </div>
            )}
            {profileData.shopAddress && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Shop Address</span>
                <span>{profileData.shopAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Checks Details */}
        {profileData.verificationAudit && profileData.verificationAudit.checks && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>4-Point Safety Verification Audit</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {Object.entries(profileData.verificationAudit.checks).map(([key, check]) => (
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
        {profileData.specialties && profileData.specialties.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Core Technical Specialties</h4>
            <div className="card-tags">
              {profileData.specialties.map((spec, i) => (
                <span key={i} className="card-tag" style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}>
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        {profileData.reviews && profileData.reviews.length > 0 ? (
          <div style={{ marginBottom: '1.5rem', background: 'var(--surface-2)', padding: '1rem', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Recent Customer Reviews</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({profileData.reviews.length} reviews)</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
              {profileData.reviews.map((rev) => (
                <div key={rev.id} style={{ background: 'var(--surface-1)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{rev.customerName}</span>
                    <RatingStars rating={rev.rating} />
                  </div>
                  {rev.comment && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>"{rev.comment}"</p>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '1.5rem', background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            🌟 {profileData.rating > 0 ? `Rating: ${profileData.rating} ★ (No detailed reviews yet)` : 'Newly registered technician — initial 0 ★ rating until emergency jobs are completed.'}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <a href={getTelLink(profileData.phone)} className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            📞 Direct Call
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            💬 WhatsApp
          </a>
          <button
            className="btn-outline"
            onClick={() => {
              onClose();
              navigate(`/verify?code=${profileData.badgeCode}`);
            }}
          >
            🛡️ Verify Badge Page
          </button>
          <button
            className="btn-sos"
            style={{ opacity: profileData.isBusy ? 0.6 : 1, cursor: profileData.isBusy ? 'not-allowed' : 'pointer' }}
            onClick={() => {
              if (profileData.isBusy) return;
              onClose();
              if (onSelect) onSelect(profileData);
              else if (onRequestHelp) onRequestHelp(profileData);
              else navigate(`/emergency?category=${(profileData.categoryName || '').toLowerCase()}`);
            }}
            disabled={profileData.isBusy}
          >
            {profileData.isBusy ? 'Currently Busy ⏳' : (actionButtonLabel || '🚨 Request Immediate Help')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TechnicianProfile;

