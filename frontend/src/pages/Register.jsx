import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';

export function Register() {
  const [role, setRole] = useState('customer'); // customer or technician
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState('Licensed Electrician');
  const [categoryId, setCategoryId] = useState(1);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

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
        ...(role === 'technician' ? { trade, categoryId: Number(categoryId) } : {}),
      };

      const user = await register(payload);
      showToast('Registration successful! Welcome to FixNearby.', 'success');
      if (user.role === 'technician') {
        navigate('/provider');
      } else {
        navigate('/');
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

          {/* Technician Specific Fields */}
          {role === 'technician' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Service Category Trade *
                </label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value={1}>⚡ Electrical Emergency</option>
                  <option value={2}>💧 Plumbing & Pipeline</option>
                  <option value={3}>🚗 Automotive Breakdown</option>
                  <option value={4}>🔐 Emergency Locksmith</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
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
          <Link to="/login" style={{ color: 'var(--accent-aqua)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

