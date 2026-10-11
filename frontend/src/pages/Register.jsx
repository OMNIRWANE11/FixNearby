import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';

export function Register() {
  const [role, setRole] = useState('customer'); // customer or technician
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [experienceYears, setExperienceYears] = useState(1);
  const [operatingRadiusKm, setOperatingRadiusKm] = useState(15);
  const [location, setLocation] = useState({
    latitude: 16.7050,
    longitude: 74.2433,
    address: '',
    accuracy: 10,
  });
  
  // New technician fields
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopContact, setShopContact] = useState('');
  const [educationDegree, setEducationDegree] = useState('');
  const [certifications, setCertifications] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    api.services.getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].id);
          setTrade(res.data[0].name);
        }
      }
    }).catch(console.error);
  }, []);

  const handleCategoryChange = (e) => {
    const newId = e.target.value;
    setCategoryId(newId);
    const cat = categories.find(c => c.id.toString() === newId.toString());
    if (cat) {
      setTrade(cat.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        role,
        savedAddress: location.address ? location.address.trim() : undefined,
        savedLatitude: location.latitude,
        savedLongitude: location.longitude,
        ...(role === 'technician' ? { 
          trade, 
          categoryId: Number(categoryId),
          experienceYears: Number(experienceYears),
          operatingRadiusKm: Number(operatingRadiusKm),
          shopName: shopName.trim() || undefined,
          shopAddress: shopAddress.trim() || location.address || undefined,
          shopContact: shopContact.trim() || undefined,
          educationDegree: educationDegree.trim() || undefined,
          certifications: certifications.trim() || undefined,
          licenseNumber: licenseNumber.trim() || undefined
        } : {}),
      };

      const user = await register(payload);
      showToast('Registration successful! Welcome to FixNearby.', 'success');
      if (user.role === 'technician') {
        navigate('/provider');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '520px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Create Account</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Join the hyper-local emergency response network in Kolhapur.
        </p>
      </div>

      <div style={{ background: 'var(--surface-1)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        {/* Role Selection Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={role === 'customer' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setRole('customer')}
            style={{ fontSize: '0.9rem' }}
          >
            👤 Citizen / Customer
          </button>
          <button
            type="button"
            className={role === 'technician' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setRole('technician')}
            style={{ fontSize: '0.9rem' }}
          >
            🛠️ Technician Provider
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Full Legal Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Sunil Patil"
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sunil@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Phone Number (E.164 / India Mobile) *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+9198XXXXXXXX"
              required
            />
          </div>

          {/* Interactive Location Pin / GPS Picker */}
          <div style={{ marginBottom: '1.25rem', padding: '1.25rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍</span>
              <span>{role === 'technician' ? 'Shop / Workshop Service Location' : 'Home / Residential Location'}</span>
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {role === 'technician'
                ? 'Your operating radius and customer distance will be calculated from this pinned location.'
                : 'Save your exact location now for instant 1-tap dispatch in future emergencies.'}
            </p>
            <LocationPicker
              location={location}
              onLocationChange={setLocation}
              addressLabel={role === 'technician' ? 'Workshop / Base Address:' : 'Street Address / Landmark:'}
              mapHeight="240px"
              hint="Tap anywhere on the map or drag the pin to set your exact location in Kolhapur."
              buttonText="USE MY CURRENT GPS LOCATION"
            />
          </div>

          {/* Technician Specific Fields */}
          {role === 'technician' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Service Category Trade *
                  </label>
                  <select value={categoryId} onChange={handleCategoryChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} style={{ background: 'var(--surface-1)', color: 'var(--text-primary)' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Trade Title / Specialization *
                  </label>
                  <input
                    type="text"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    placeholder="e.g. Master Licensed Electrician"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Operating Radius (km) *
                  </label>
                  <input
                    type="number"
                    value={operatingRadiusKm}
                    onChange={(e) => setOperatingRadiusKm(e.target.value)}
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Professional & Shop Details</h4>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Trade / Govt License Number *
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="Mandatory for verification"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                      Shop/Business Name (if any)
                    </label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Star Electricals"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                      Shop Contact Number
                    </label>
                    <input
                      type="tel"
                      value={shopContact}
                      onChange={(e) => setShopContact(e.target.value)}
                      placeholder="e.g. +91231XXXXXXX"
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Shop Address
                  </label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    placeholder="Full shop address"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                      Education Degree (Relevant)
                    </label>
                    <input
                      type="text"
                      value={educationDegree}
                      onChange={(e) => setEducationDegree(e.target.value)}
                      placeholder="e.g. ITI, Diploma in Plumbing"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                      Other Certifications
                    </label>
                    <input
                      type="text"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      placeholder="e.g. ISO 9001, Safety Cert"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Password (min 6 characters) *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Registering Account...' : 'Complete Registration ➔'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirectUrl)}`} style={{ color: 'var(--accent-aqua)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

