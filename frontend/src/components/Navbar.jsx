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
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" aria-label="FixNearby Home">
          <span className="brand-logo-badge">⚡</span>
          <span className="brand-name">FIXNEARBY</span>
          <span className="brand-dot"></span>
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
              <NavLink to="/emergency" className={({ isActive }) => `nav-link-sos ${isActive ? 'active' : ''}`}>
                🚨 Emergency SOS
              </NavLink>
            </li>
            <li>
              <NavLink to="/requests" className={({ isActive }) => (isActive ? 'active' : '')}>
                My Requests
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
            <Link to={user.role === 'technician' ? '/provider' : '/profile'} className="nav-account-btn">
              <span>👤</span>
              <span>{user.role === 'technician' ? 'Provider Portal' : 'My Account'}</span>
            </Link>
          ) : (
            <Link to="/login" className="nav-account-btn btn-provider-link">
              <span>👤</span>
              <span>Provider Login</span>
            </Link>
          )}

          {/* Header SOS Action */}
          <button
            onClick={() => navigate('/emergency')}
            className="btn-nav-sos"
            aria-label="Trigger SOS Emergency Repair"
          >
            <span>🚨 SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

