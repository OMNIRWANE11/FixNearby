import React from 'react';
import { useNavigate } from 'react-router-dom';

export function SOSButton() {
  const navigate = useNavigate();

  return (
    <button
      className="floating-sos-btn"
      onClick={() => navigate('/emergency')}
      aria-label="Instant Emergency Assistance SOS"
      title="Tap for Immediate Emergency Help"
    >
      <span style={{ fontSize: '1rem' }}>🚨</span>
      <span>SOS</span>
    </button>
  );
}

export default SOSButton;

