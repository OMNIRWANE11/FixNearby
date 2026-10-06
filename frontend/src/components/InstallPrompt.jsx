import React, { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '5.5rem',
        left: '1.25rem',
        zIndex: 1500,
        background: 'var(--surface-2)',
        border: '1px solid var(--accent-aqua)',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '380px',
      }}
    >
      <div style={{ fontSize: '1.8rem' }}>📱</div>
      <div style={{ flexGrow: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Install FixNearby PWA</div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
          Fast offline access during urgent repair emergencies.
        </p>
      </div>
      <button className="btn-primary" onClick={handleInstall} style={{ minHeight: '38px', padding: '0 0.75rem', fontSize: '0.85rem' }}>
        Install
      </button>
      <button
        onClick={() => setShowPrompt(false)}
        style={{ background: 'transparent', color: 'var(--text-muted)', minHeight: 'auto', padding: '4px' }}
      >
        ✕
      </button>
    </div>
  );
}

export default InstallPrompt;

