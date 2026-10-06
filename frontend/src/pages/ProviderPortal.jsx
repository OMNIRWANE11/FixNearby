import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderRequestCard from '../components/ProviderRequestCard';
import RatingStars from '../components/RatingStars';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import { useToast } from '../components/Toast';
import api from '../services/api';

export function ProviderPortal() {
  const { user, isTechnician, isAuthenticated } = useAuth();
  const { location } = useGeolocation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isOnDuty, setIsOnDuty] = useState(user?.technician?.isOnDuty || false);
  const [requests, setRequests] = useState({
    activeRequests: [],
    incomingPending: [],
    completedHistory: [],
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not technician
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/provider');
    } else if (!isTechnician) {
      showToast('Technician credentials required to access provider portal.', 'warning');
      navigate('/profile');
    }
  }, [isAuthenticated, isTechnician, navigate]);

  // Fetch provider requests
  const loadRequests = async () => {
    try {
      const res = await api.provider.getRequests();
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTechnician) {
      loadRequests();
      const interval = setInterval(loadRequests, 12000); // 12-second refresh
      return () => clearInterval(interval);
    }
  }, [isTechnician]);

  // Periodic location heartbeat when online (15-second interval)
  useEffect(() => {
    if (!isOnDuty || !location.latitude) return;

    const sendHeartbeat = async () => {
      try {
        await api.provider.updateLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          speedKmh: 30.0,
        });
      } catch (err) {
        // Silent
      }
    };

    sendHeartbeat();
    const timer = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(timer);
  }, [isOnDuty, location.latitude, location.longitude]);

  const handleToggleDuty = async () => {
    const nextState = !isOnDuty;
    try {
      const res = await api.provider.toggleDuty(nextState);
      if (res.success) {
        setIsOnDuty(nextState);
        showToast(`You are now ${nextState ? 'ONLINE & receiving emergency calls' : 'OFFLINE'}`, nextState ? 'success' : 'info');
      }
    } catch (err) {
      showToast('Failed to update duty status.', 'error');
    }
  };

  const handleRespond = async (reqId, action) => {
    try {
      const res = await api.provider.respondRequest(reqId, action);
      if (res.success) {
        showToast(`Request action '${action}' recorded.`, 'success');
        loadRequests();
      }
    } catch (err) {
      showToast(err.error?.message || 'Failed to update request state.', 'error');
    }
  };

  if (loading) return <Loader label="Loading technician dispatch portal..." />;

  const tech = user?.technician || {};

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* 1. Header with Duty Status Toggle */}
      <div className="provider-dashboard-header">
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Technician Dispatch Console</span>
          <h1 style={{ fontSize: '1.8rem', margin: '0.2rem 0' }}>
            Good day, {user?.fullName || 'Technician'}
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem' }}>
            <span style={{ fontFamily: 'monospace', color: 'var(--accent-aqua)', fontWeight: 700 }}>
              {tech.badgeCode || 'FN-PROVIDER'}
            </span>
            <span>• {tech.trade || 'Emergency Pro'}</span>
            <span className={`badge-tag ${tech.isVerified ? 'badge-verified' : 'badge-warning'}`}>
              {tech.isVerified ? 'Verified 🛡️' : 'Pending Audit'}
            </span>
          </div>
        </div>

        {/* Large Duty Switch Button */}
        <div>
          <button
            className={`duty-toggle-btn ${isOnDuty ? 'online' : 'offline'}`}
            onClick={handleToggleDuty}
          >
            {isOnDuty ? '🟢 ONLINE & ACTIVE' : '⚪ GO ON DUTY'}
          </button>
        </div>
      </div>

      {/* 2. Provider Profile & Trust Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trust Rating</div>
          <div style={{ marginTop: '0.25rem' }}>
            <RatingStars rating={tech.rating || 5.0} />
          </div>
        </div>
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed Jobs</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {tech.jobsCompleted || 0}
          </div>
        </div>
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Coverage Radius</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-aqua)' }}>
            {tech.operatingRadiusKm || 15} km
          </div>
        </div>
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Status</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isOnDuty ? 'var(--accent-aqua)' : 'var(--text-muted)' }}>
            {isOnDuty ? 'Transmitting GPS' : 'Duty Paused'}
          </div>
        </div>
      </div>

      {/* 3. Active Emergency In-Progress */}
      {requests.activeRequests && requests.activeRequests.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--alert-red)', marginBottom: '1rem' }}>
            🚨 Active Emergency Calls in Progress ({requests.activeRequests.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {requests.activeRequests.map((req) => (
              <ProviderRequestCard
                key={req.id}
                request={req}
                onRespond={handleRespond}
                type="active"
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Incoming Pending Requests (Matching Trade) */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
          Incoming Broadcast Requests in Your Sector ({requests.incomingPending.length})
        </h2>
        {requests.incomingPending.length === 0 ? (
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No pending emergency broadcasts in your trade right now. Stay online to receive the next instant alert.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {requests.incomingPending.map((req) => (
              <ProviderRequestCard
                key={req.id}
                request={req}
                onRespond={handleRespond}
                type="pending"
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Completed Jobs History */}
      <section>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
          Recent Job History ({requests.completedHistory.length})
        </h2>
        {requests.completedHistory.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No completed jobs recorded yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {requests.completedHistory.map((req) => (
              <div key={req.id} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{req.problemName || req.categoryName}</strong>
                  <span className={`badge-tag ${req.status === 'COMPLETED' ? 'badge-verified' : 'badge-unverified'}`}>
                    {req.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Citizen: {req.customerName}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProviderPortal;

