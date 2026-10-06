import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col">
            <div className="brand-logo" style={{ marginBottom: '1rem' }}>
              <span>FIXNEARBY</span>
              <span className="brand-dot">.</span>
            </div>
            <p style={{ maxWidth: '340px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Crisis-optimized, hyper-local emergency technician discovery and verified dispatch marketplace. Direct contact with zero middleman commissions.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge-tag badge-verified">PostGIS Geo-Routing</span>
              <span className="badge-tag badge-verified">4-Point Verified</span>
              <span className="badge-tag badge-verified">Zero Commission</span>
            </div>
          </div>

          {/* Emergency Services */}
          <div className="footer-col">
            <h4>Emergency Trades</h4>
            <ul className="footer-links">
              <li><Link to="/emergency?category=electrical">⚡ Electrical Emergency</Link></li>
              <li><Link to="/emergency?category=plumbing">💧 Plumbing & Leakage</Link></li>
              <li><Link to="/emergency?category=automotive">🚗 Roadside Breakdown</Link></li>
              <li><Link to="/emergency?category=locksmith">🔐 Lockout & Keys</Link></li>
              <li><Link to="/directory">📋 Emergency Directory</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-links">
              <li><Link to="/verify">Verify Technician Badge</Link></li>
              <li><Link to="/safety">Crisis Safety Guides</Link></li>
              <li><Link to="/services">All Technicians</Link></li>
              <li><Link to="/about">About Architecture</Link></li>
              <li><Link to="/provider">Technician Portal</Link></li>
            </ul>
          </div>

          {/* National Emergency Hotline numbers */}
          <div className="footer-col">
            <h4>National Helplines (India)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              <a href="tel:112" style={{ background: 'var(--surface-2)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800', color: 'var(--alert-red)' }}>112</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All Emergency</span>
              </a>
              <a href="tel:101" style={{ background: 'var(--surface-2)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800', color: 'var(--warning)' }}>101</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fire Brigade</span>
              </a>
              <a href="tel:108" style={{ background: 'var(--surface-2)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-aqua)' }}>108</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ambulance</span>
              </a>
              <a href="tel:100" style={{ background: 'var(--surface-2)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>100</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Police Control</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} FixNearby. Built for crisis resilience and citizen emergency safety.
          </div>
          <div>
            Kolhapur Municipal Region, Maharashtra, India
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

