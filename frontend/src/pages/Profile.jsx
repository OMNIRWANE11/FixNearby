import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';

export function Profile() {
  const { user, isTechnician, isAuthenticated, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Basic Personal Info
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Technician Specific Info
  const [trade, setTrade] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState(1);
  const [operatingRadiusKm, setOperatingRadiusKm] = useState(15);
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopContact, setShopContact] = useState('');
  const [educationDegree, setEducationDegree] = useState('');
  const [certifications, setCertifications] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Location State
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

      const tech = user.technician || {};
      setTrade(tech.trade || '');
      setWhatsappNumber(tech.whatsappNumber || tech.phone || user.phone || '');
      setExperienceYears(tech.experienceYears ?? 1);
      setOperatingRadiusKm(tech.operatingRadiusKm ?? 15);
      setShopName(tech.shopName || '');
      setShopAddress(tech.shopAddress || user.savedAddress || '');
      setShopContact(tech.shopContact || tech.phone || user.phone || '');
      setEducationDegree(tech.educationDegree || '');
      setCertifications(tech.certifications || '');
      setLicenseNumber(tech.licenseNumber || '');

      const initialLat = isTechnician
        ? (tech.currentLatitude || user.savedLatitude || 16.7050)
        : (user.savedLatitude || 16.7050);
      const initialLng = isTechnician
        ? (tech.currentLongitude || user.savedLongitude || 74.2433)
        : (user.savedLongitude || 74.2433);
      const initialAddr = isTechnician
        ? (tech.shopAddress || user.savedAddress || '')
        : (user.savedAddress || '');

      setLocation({
        latitude: initialLat,
        longitude: initialLng,
        address: initialAddr,
        accuracy: 10,
      });
    }
  }, [user, isTechnician]);

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    // If technician and shop address is blank or matches previous location, update shopAddress
    if (isTechnician && newLocation.address && (!shopAddress || shopAddress === location.address)) {
      setShopAddress(newLocation.address);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        savedAddress: location.address ? location.address.trim() : '',
        savedLatitude: location.latitude,
        savedLongitude: location.longitude,
      };

      if (isTechnician) {
        payload.trade = trade.trim();
        payload.whatsappNumber = (whatsappNumber || phone).trim();
        payload.experienceYears = parseInt(experienceYears, 10) || 0;
        payload.operatingRadiusKm = parseFloat(operatingRadiusKm) || 15.0;
        payload.shopName = shopName.trim();
        payload.shopAddress = shopAddress.trim() || (location.address ? location.address.trim() : '');
        payload.shopContact = (shopContact || phone).trim();
        payload.educationDegree = educationDegree.trim();
        payload.certifications = certifications.trim();
        payload.licenseNumber = licenseNumber.trim();
      }

      const res = await api.auth.updateProfile(payload);
      if (res.success && res.data) {
        setUser(res.data);
        showToast(
          isTechnician
            ? 'Technician profile & workshop location updated successfully!'
            : 'Profile and saved location updated successfully!',
          'success'
        );
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

  const tech = user.technician || {};

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '740px' }}>
      {/* Page Title & Subtitle */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isTechnician ? 'Service Provider Account' : 'FixNearby Citizen Profile'}
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '0.2rem 0' }}>
              {isTechnician ? 'Technician & Shop Profile' : 'Citizen Profile'}
            </h1>
          </div>

          {isTechnician && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent-aqua)', fontWeight: 700, padding: '0.3rem 0.6rem', background: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                {tech.badgeCode || 'FN-PROVIDER'}
              </span>
              <span className={`badge-tag ${tech.isVerified ? 'badge-verified' : 'badge-warning'}`}>
                {tech.isVerified ? 'Verified 🛡️' : 'Pending Audit'}
              </span>
            </div>
          )}
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {isTechnician
            ? 'Manage your professional credentials, shop contact, and base workshop location for emergency dispatch routing.'
            : 'Manage your emergency contact information and saved home address for faster dispatch.'}
        </p>
      </div>

      <div style={{ background: 'var(--surface-1)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <form onSubmit={handleUpdate}>
          {/* SECTION 1: Personal Contact Info */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👤</span>
              <span>Personal & Contact Info</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Email Address (Account ID)
                </label>
                <input type="email" value={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed', width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Primary Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              {isTechnician && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    WhatsApp Mobile Number (for SOS alerts) *
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Technician Workshop & Service Radius Details (Only for Technician) */}
          {isTechnician && (
            <div style={{ marginBottom: '1.75rem', padding: '1.25rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏪</span>
                <span>Shop / Workshop Details</span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Displayed on your public emergency provider card and verified by citizens before hire.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Shop / Workshop Name
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Shree Ganesh Electrical Works"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Shop Landline / Helpline Contact
                  </label>
                  <input
                    type="tel"
                    value={shopContact}
                    onChange={(e) => setShopContact(e.target.value)}
                    placeholder="e.g. 0231-2654321 or Mobile"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Shop Street Address
                  </label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    placeholder="e.g. 104 Shivaji Road, Opp. Mahadwar, Kolhapur"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Service Operating Radius (km): <strong style={{ color: 'var(--accent-aqua)' }}>{operatingRadiusKm} km</strong>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="50"
                    step="1"
                    value={operatingRadiusKm}
                    onChange={(e) => setOperatingRadiusKm(e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>3 km</span>
                    <span>15 km (Default)</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Interactive Location Picker */}
          <div style={{ marginBottom: '1.75rem', padding: '1.25rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍</span>
              <span>{isTechnician ? 'Base Workshop & Dispatch Location (GPS)' : 'Saved Home / Base Location'}</span>
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {isTechnician
                ? 'Emergency dispatches match your location and calculate road ETA based on this pinned workshop coordinates.'
                : 'Emergency technicians will use this pinned location when you request rapid dispatch from home.'}
            </p>
            <LocationPicker
              location={location}
              onLocationChange={handleLocationChange}
              addressLabel={isTechnician ? 'Workshop / Base Street Address:' : 'Home / Office Street Address:'}
              mapHeight="280px"
              hint={isTechnician ? 'Drag pin or click map to set your physical shop/base workshop.' : 'Tap anywhere on the map or drag the pin to set your exact home base.'}
              buttonText="DETECT CURRENT GPS LOCATION"
            />
          </div>

          {/* SECTION 4: Professional Credentials (Only for Technician) */}
          {isTechnician && (
            <div style={{ marginBottom: '1.75rem', padding: '1.25rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛠️</span>
                <span>Trade Credentials & Licensing</span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                These qualifications are audited for the 4-Point Verified Badge.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Primary Trade Specialty *
                  </label>
                  <select
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                  >
                    <option value="">Select Trade Specialty</option>
                    <option value="Electrician">⚡ Electrician</option>
                    <option value="Plumber">🔧 Plumber</option>
                    <option value="Mechanic">🚗 Vehicle Mechanic</option>
                    <option value="Appliance Repair">❄️ AC / Appliance Repair</option>
                    <option value="Locksmith">🔑 Locksmith</option>
                    <option value="Carpenter">🪚 Carpenter</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Years of Field Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Government Trade License / Registration No.
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. LIC-MH-2024-8841"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Highest Education / Degree / Diploma
                  </label>
                  <input
                    type="text"
                    value={educationDegree}
                    onChange={(e) => setEducationDegree(e.target.value)}
                    placeholder="e.g. Diploma in Electrical Engineering, ITI"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Certifications & Special Training
                  </label>
                  <input
                    type="text"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="e.g. Maharashtra Govt Wireman Certified, Heavy Machinery License"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ minWidth: '180px' }}>
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleLogout} style={{ color: 'var(--alert-red)' }}>
              Logout
            </button>
          </div>
        </form>

        <hr style={{ borderColor: 'var(--border)', margin: '2rem 0' }} />

        {/* Quick Navigation Actions */}
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Quick Actions</h3>
          {isTechnician ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <Link to="/provider" className="btn-primary" style={{ textAlign: 'center', background: 'var(--accent-blue)' }}>
                🛠️ Dispatch Console
              </Link>
              <Link to="/verify" className="btn-secondary" style={{ textAlign: 'center' }}>
                🛡️ Audit Verification
              </Link>
              <Link to="/emergency" className="btn-sos" style={{ textAlign: 'center' }}>
                🚨 SOS Test
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Link to="/requests" className="btn-secondary" style={{ textAlign: 'center' }}>
                View My Requests
              </Link>
              <Link to="/emergency" className="btn-sos" style={{ textAlign: 'center' }}>
                Launch Emergency SOS
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
