import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';

export function Navbar() {
  const [isCompact, setIsCompact] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { location } = useGeolocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isCompact ? 'compact' : ''}`}>
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" aria-label="FixNearby Home">
          <span>FIXNEARBY</span>
          <span className="brand-dot">.</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links" aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className={({ isActive }) => (isActive ? 'active' : '')}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/emergency" className={({ isActive }) => (isActive ? 'active' : '')}>
                Emergency SOS
              </NavLink>
            </li>
            <li>
              <NavLink to="/verify" className={({ isActive }) => (isActive ? 'active' : '')}>
                Verify Badge
              </NavLink>
            </li>
            <li>
              <NavLink to="/safety" className={({ isActive }) => (isActive ? 'active' : '')}>
                Safety Guides
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
                About
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Right Action Items */}
        <div className="nav-actions">
          {/* Location status pill */}
          <div className="nav-location-pill" title={`GPS: ${location.latitude}, ${location.longitude}`}>
            <span className="status-dot"></span>
            <span>Kolhapur</span>
          </div>

          {/* User / Provider Login */}
          {isAuthenticated ? (
            <Link to={user.role === 'technician' ? '/provider' : '/profile'} className="btn-secondary" style={{ minHeight: '40px', padding: '0 1rem', fontSize: '0.9rem' }}>
              {user.role === 'technician' ? 'Provider Portal' : 'My Account'}
            </Link>
          ) : (
            <Link to="/login" className="btn-secondary btn-provider-link" style={{ minHeight: '40px', padding: '0 1rem', fontSize: '0.9rem' }}>
              Provider Login
            </Link>
          )}

          {/* Header SOS Action */}
          <button
            onClick={() => navigate('/emergency')}
            className="btn-nav-sos"
            aria-label="Trigger SOS Emergency Repair"
          >
            SOS
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

