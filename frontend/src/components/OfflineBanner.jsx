import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Link } from 'react-router-dom';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      style={{
        backgroundColor: '#FF3333',
        color: '#FFFFFF',
        padding: '0.6rem 1rem',
        textAlign: 'center',
        fontSize: '0.9rem',
        fontWeight: 600,
        position: 'sticky',
        top: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}
      role="status"
    >
      <span>⚡ You're currently offline.</span>
      <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
        Cached emergency safety guides and direct emergency numbers are still available.
      </span>
      <Link
        to="/safety"
        style={{
          color: '#FFFFFF',
          textDecoration: 'underline',
          fontWeight: 700,
          background: 'rgba(0,0,0,0.2)',
          padding: '2px 8px',
          borderRadius: '4px',
        }}
      >
        View Safety Guides
      </Link>
    </div>
  );
}

export default OfflineBanner;

