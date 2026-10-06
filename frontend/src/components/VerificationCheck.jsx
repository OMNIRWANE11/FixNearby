import React from 'react';

export function VerificationCheck({ title, status, passed, details, reason, metadata = {} }) {
  const isPass = passed || status === 'PASS';

  return (
    <div className={`audit-check-card ${isPass ? 'pass' : 'fail'}`}>
      <div>
        <div className="audit-header">
          <h4 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)' }}>{title}</h4>
          <span className={`audit-status-badge ${isPass ? 'pass' : 'fail'}`}>
            {isPass ? 'PASS ✓' : 'FAIL ✕'}
          </span>
        </div>
        <p style={{ fontSize: '0.9rem', color: isPass ? 'var(--text-secondary)' : 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {details}
        </p>

        {/* Failed reason highlight */}
        {!isPass && reason && (
          <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--alert-red-dim)', borderRadius: '4px', borderLeft: '3px solid var(--alert-red)', fontSize: '0.85rem', color: '#ffb3b3' }}>
            <strong>Safety Warning:</strong> {reason}
          </div>
        )}
      </div>

      {/* Metadata tags */}
      {Object.keys(metadata).length > 0 && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {Object.entries(metadata).map(([k, v]) => (
            v != null && <div key={k}>{k}: <span style={{ color: 'var(--text-secondary)' }}>{String(v)}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VerificationCheck;

