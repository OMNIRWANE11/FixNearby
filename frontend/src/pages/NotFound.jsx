import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ textAlign: 'center', padding: '6rem 1.5rem', maxWidth: '580px' }}>
      <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--accent-aqua)', letterSpacing: '-0.05em' }}>
        404
      </div>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0 0.5rem' }}>
        Looks like this route is broken.
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        The emergency page or path you requested could not be located on the FixNearby network.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => navigate('/')}>
          🏠 GO HOME
        </button>
        <button className="btn-sos" onClick={() => navigate('/emergency')}>
          🚨 FIND EMERGENCY HELP
        </button>
      </div>
    </div>
  );
}

export default NotFound;

