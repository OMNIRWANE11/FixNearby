import React from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SOSButton from './components/SOSButton';
import OfflineBanner from './components/OfflineBanner';
import InstallPrompt from './components/InstallPrompt';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ToastProvider } from './components/Toast';

import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/responsive.css';

export function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <ToastProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <OfflineBanner />
            <Navbar />

            <main style={{ flex: 1 }}>
              <AppRoutes />
            </main>

            {/* Global Floating SOS Button */}
            <SOSButton />

            {/* PWA Install Trigger */}
            <InstallPrompt />

            {/* Bottom Mobile Navigation */}
            <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
              <ul className="mobile-nav-items">
                <li className="mobile-nav-item">
                  <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                    <span>🏠</span>
                    <span>Home</span>
                  </NavLink>
                </li>
                <li className="mobile-nav-item">
                  <NavLink to="/services" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <span>🛠️</span>
                    <span>Services</span>
                  </NavLink>
                </li>
                <li className="mobile-nav-item mobile-nav-sos">
                  <NavLink to="/emergency" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <span style={{ fontSize: '1.2rem' }}>🚨</span>
                    <span>SOS</span>
                  </NavLink>
                </li>
                <li className="mobile-nav-item">
                  <NavLink to="/requests" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <span>📋</span>
                    <span>Track</span>
                  </NavLink>
                </li>
                <li className="mobile-nav-item">
                  <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <span>👤</span>
                    <span>Profile</span>
                  </NavLink>
                </li>
              </ul>
            </nav>

            <Footer />
          </div>
        </ToastProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;

