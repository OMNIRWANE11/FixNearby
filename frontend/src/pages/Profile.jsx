import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import api from '../services/api';

import LocationPicker from '../components/LocationPicker';

export function Profile() {
  const { user, isAuthenticated, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState({
    latitude: user?.savedLatitude || 16.7050,
    longitude: user?.savedLongitude || 74.2433,
    address: user?.savedAddress || '',
    accuracy: 10,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/profile');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setLocation({
        latitude: user.savedLatitude || 16.7050,
        longitude: user.savedLongitude || 74.2433,
        address: user.savedAddress || '',
        accuracy: 10,
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.auth.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        savedAddress: location.address ? location.address.trim() : '',
        savedLatitude: location.latitude,
        savedLongitude: location.longitude,
      });
      if (res.success && res.data) {
        setUser(res.data);
        showToast('Profile and saved location updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.error?.message || err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('You have been logged out securely.', 'info');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '640px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', margin: '0 0 0.25rem' }}>Citizen Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your emergency contact information and saved home address for faster dispatch.
        </p>
      </div>

      <div style={{ background: 'var(--surface-1)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <input type="email" value={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Primary Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Interactive Saved Location Picker */}
          <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍</span>
              <span>Saved Home / Base Location</span>
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Emergency technicians will use this pinned location when you request rapid dispatch from home.
            </p>
            <LocationPicker
              location={location}
              onLocationChange={setLocation}
              addressLabel="Home / Office Street Address:"
              mapHeight="280px"
              hint="Tap anywhere on the map or drag the pin to set your exact home base."
              buttonText="DETECT CURRENT GPS LOCATION"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleLogout} style={{ color: 'var(--alert-red)' }}>
              Logout
            </button>
          </div>
        </form>

        <hr style={{ borderColor: 'var(--border)', margin: '2rem 0' }} />

        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Link to="/requests" className="btn-secondary" style={{ textAlign: 'center' }}>
              View My Requests
            </Link>
            <Link to="/emergency" className="btn-sos" style={{ textAlign: 'center' }}>
              Launch Emergency SOS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

