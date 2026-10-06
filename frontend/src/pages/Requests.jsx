import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmergencyRequestCard from '../components/EmergencyRequestCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export function Requests() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/requests');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    async function loadUserRequests() {
      if (!isAuthenticated) return;
      try {
        const res = await api.requests.getMyRequests();
        if (res.success && res.data) {
          setRequests(res.data);
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadUserRequests();
  }, [isAuthenticated]);

  if (authLoading || loading) return <Loader label="Loading your past emergency requests..." />;

  const active = requests.filter((r) => ['PENDING', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED'].includes(r.status));
  const past = requests.filter((r) => ['COMPLETED', 'CANCELLED'].includes(r.status));

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Emergency Request History</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Monitor active dispatches and view past completed repairs.
          </p>
        </div>
        <button className="btn-sos" onClick={() => navigate('/emergency')}>
          🚨 New SOS Request
        </button>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="No emergency requests found"
          description="You haven't submitted any emergency calls yet. If you have an urgent breakdown, click below."
          actionLabel="Request Emergency SOS"
          onAction={() => navigate('/emergency')}
          icon="📋"
        />
      ) : (
        <div>
          {/* Active Calls */}
          {active.length > 0 && (
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--alert-red)', marginBottom: '1rem' }}>
                🚨 Active Calls ({active.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {active.map((req) => (
                  <EmergencyRequestCard key={req.id} request={req} />
                ))}
              </div>
            </section>
          )}

          {/* Past Calls */}
          <section>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
              Past History ({past.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {past.map((req) => (
                <EmergencyRequestCard key={req.id} request={req} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Requests;

