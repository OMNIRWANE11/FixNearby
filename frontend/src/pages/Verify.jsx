import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BadgeInput from '../components/BadgeInput';
import VerificationResult from '../components/VerificationResult';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';
import api from '../services/api';

export function Verify() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [codeFromUrl, setCodeFromUrl] = useState(searchParams.get('code') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleVerifyBadge(code);
    }
  }, [searchParams]);

  const handleVerifyBadge = async (badgeCode) => {
    setLoading(true);
    setResult(null);
    try {
      searchParams.set('code', badgeCode.toUpperCase());
      setSearchParams(searchParams);

      const res = await api.verification.verifyBadge(badgeCode);
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.isVerified) {
          showToast(`Badge ${badgeCode} Verified: Credentials Active!`, 'success');
        } else {
          showToast(`Warning: Badge ${badgeCode} failed one or more safety checks.`, 'error');
        }
      }
    } catch (err) {
      setResult({
        badgeCode: badgeCode.toUpperCase(),
        overallStatus: err.error?.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'INVALID_FORMAT',
        isVerified: false,
        errorMessage: err.error?.message || 'Could not verify badge code.',
        technician: null,
        audit: null,
      });
      showToast(err.error?.message || 'Badge verification query failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container verify-page-wrap">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="badge-tag badge-verified" style={{ marginBottom: '0.75rem' }}>
          🛡️ CITIZEN SECURITY SYSTEM
        </span>
        <h1 style={{ fontSize: '2.4rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
          Verify Before You Open the Door
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto' }}>
          Check a FixNearby technician's credentials, criminal background clearance, and trade license in seconds.
        </p>
      </div>

      {/* Badge Code Form */}
      <div style={{ background: 'var(--surface-1)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <h3 style={{ fontSize: '1.15rem', textAlign: 'center', marginBottom: '1rem' }}>
          Enter Technician Badge ID
        </h3>
        <BadgeInput
          initialValue={codeFromUrl}
          onVerify={handleVerifyBadge}
          loading={loading}
        />
      </div>

      {/* Loading Indicator */}
      {loading && <Loader label="Querying municipal background check records & trade licenses..." />}

      {/* Verification Result Display */}
      {result && <VerificationResult result={result} />}
    </div>
  );
}

export default Verify;

