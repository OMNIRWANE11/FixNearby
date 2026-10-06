import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.fullName}!`, 'success');
      if (user.role === 'technician') {
        navigate('/provider');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      showToast(err.message || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '480px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Account Login</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Sign in to access your request dashboard or technician provider console.
        </p>
      </div>

      <div style={{ background: 'var(--surface-1)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rajesh.patil@fixnearby.local"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In ➔'}
          </button>
        </form>

        {/* Demo Fast-Fill Shortcuts */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Demo Fast-Login Credentials:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleFillDemo('rajesh.patil@fixnearby.local', 'TechPass@123')}
              style={{ minHeight: '36px', fontSize: '0.8rem', justifyContent: 'flex-start' }}
            >
              ⚡ Provider: Rajesh Patil (FN-88492)
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleFillDemo('citizen@fixnearby.local', 'CitizenPass@123')}
              style={{ minHeight: '36px', fontSize: '0.8rem', justifyContent: 'flex-start' }}
            >
              👤 Citizen: Ananya Sharma
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleFillDemo('admin@fixnearby.local', 'AdminPass@123')}
              style={{ minHeight: '36px', fontSize: '0.8rem', justifyContent: 'flex-start' }}
            >
              🛡️ Admin: City Administrator
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent-aqua)', fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

