import React from 'react';
import { getTelLink, getWhatsAppLink } from '../utils/contactLinks';
import VerificationCheck from './VerificationCheck';
import RatingStars from './RatingStars';

export function VerificationResult({ result }) {
  if (!result) return null;

  const { badgeCode, overallStatus, isVerified, technician, audit, errorMessage } = result;

  const whatsappUrl = technician ? getWhatsAppLink(technician.phone, {
    category: technician.trade,
    problem: 'Doorstep badge check',
    requestId: badgeCode
  }) : '#';

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* 1. Large Status Banner */}
      <div className={`verification-status-banner ${isVerified ? 'verified' : 'unverified'}`}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          {isVerified ? '🛡️' : '⚠️'}
        </div>
        <h2 style={{ fontSize: '1.8rem', color: isVerified ? 'var(--accent-aqua)' : 'var(--alert-red)', marginBottom: '0.25rem' }}>
          {isVerified ? 'VERIFIED TECHNICIAN' : 'AUDIT NOT VERIFIED / FAILED'}
        </h2>
        <p style={{ fontSize: '1.05rem', color: isVerified ? 'var(--text-primary)' : '#ff9999', margin: 0 }}>
          {isVerified
            ? `Badge ${badgeCode} has passed all 4 required security and technical checks.`
            : (errorMessage || `Badge ${badgeCode} does not meet FixNearby safety verification standards.`)}
        </p>
      </div>

      {/* 2. Security Warning Box */}
      <div className="safety-alert warning">
        <span>🔒</span>
        <div>
          <strong>Important Safety Notice:</strong> Always check the technician's face and photo against this verified profile before opening the door or granting entry to your premises.
        </div>
      </div>

      {/* 3. Technician Summary Card (if technician exists) */}
      {technician && (
        <div className="tech-card" style={{ marginBottom: '2rem', borderColor: isVerified ? 'var(--accent-aqua)' : 'var(--alert-red)' }}>
          <div className="tech-card-header">
            <img
              src={technician.profileImageUrl || '/images/technicians/tech-default.svg'}
              alt={technician.name}
              className="tech-avatar"
            />
            <div className="tech-meta" style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.3rem' }}>{technician.name}</h3>
                <span className={`badge-tag ${isVerified ? 'badge-verified' : 'badge-unverified'}`}>
                  {isVerified ? 'Verified' : 'Flagged / Incomplete'}
                </span>
              </div>
              <p style={{ color: 'var(--accent-aqua)', fontWeight: 600 }}>{technician.trade}</p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{badgeCode}</span>
                <span style={{ color: 'var(--text-muted)' }}>• {technician.experienceYears} Years Exp</span>
                <span style={{ color: technician.isOnDuty ? 'var(--accent-aqua)' : 'var(--text-muted)' }}>
                  • {technician.isOnDuty ? '🟢 On Duty' : '⚪ Off Duty'}
                </span>
              </div>
            </div>
          </div>

          <div className="tech-stats-row">
            <div>
              <div className="tech-stat-label">Trust Rating</div>
              <div className="tech-stat-val">
                <RatingStars rating={technician.rating} />
              </div>
            </div>
            <div>
              <div className="tech-stat-label">Completed Jobs</div>
              <div className="tech-stat-val">{technician.jobsCompleted}</div>
            </div>
            <div>
              <div className="tech-stat-label">Service Radius</div>
              <div className="tech-stat-val">{technician.operatingRadiusKm} km</div>
            </div>
          </div>

          <div className="tech-action-buttons">
            <a href={getTelLink(technician.phone)} className="btn-primary" style={{ textDecoration: 'none' }}>
              📞 Call Directly
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>
              💬 WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* 4. 4-Point Audit Checklist Grid */}
      {audit && audit.checks && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>4-Point Safety Audit Results</h3>
          <div className="audit-grid">
            <VerificationCheck
              title={audit.checks.identityCheck.title}
              status={audit.checks.identityCheck.status}
              passed={audit.checks.identityCheck.passed}
              details={audit.checks.identityCheck.details}
              reason={audit.checks.identityCheck.reason}
              metadata={{ "Legal Name": audit.checks.identityCheck.legalName }}
            />
            <VerificationCheck
              title={audit.checks.licenseCheck.title}
              status={audit.checks.licenseCheck.status}
              passed={audit.checks.licenseCheck.passed}
              details={audit.checks.licenseCheck.details}
              reason={audit.checks.licenseCheck.reason}
              metadata={{
                "Certification": audit.checks.licenseCheck.tradeName,
                "License ID": audit.checks.licenseCheck.licenseNumberMasked,
                "Valid Until": audit.checks.licenseCheck.validUntil
              }}
            />
            <VerificationCheck
              title={audit.checks.policeCheck.title}
              status={audit.checks.policeCheck.status}
              passed={audit.checks.policeCheck.passed}
              details={audit.checks.policeCheck.details}
              reason={audit.checks.policeCheck.reason}
              metadata={{
                "Address Check": audit.checks.policeCheck.addressStatus,
                "Police Status": audit.checks.policeCheck.policeStatus
              }}
            />
            <VerificationCheck
              title={audit.checks.ratingCheck.title}
              status={audit.checks.ratingCheck.status}
              passed={audit.checks.ratingCheck.passed}
              details={audit.checks.ratingCheck.details}
              reason={audit.checks.ratingCheck.reason}
              metadata={{
                "Current Rating": `${audit.checks.ratingCheck.currentRating}/5.0 (Min: 4.0)`,
                "Jobs Done": `${audit.checks.ratingCheck.jobsCompleted} (Min: 5)`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationResult;

