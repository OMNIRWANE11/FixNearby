import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import api from '../services/api';

export function Profile() {
  const { user, isAuthenticated, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.savedAddress || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/profile');
    }
  }, [isAuthenticated, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.auth.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        savedAddress: address.trim(),
      });
      if (res.success && res.data) {
        setUser(res.data);
        showToast('Profile information updated successfully.', 'success');
      }
    } catch (err) {
      showToast(err.error?.message || 'Failed to update profile.', 'error');
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Saved Home / Business Address
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., Flat 402, Royal Palms, Shahupuri 2nd Lane, Kolhapur"
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

