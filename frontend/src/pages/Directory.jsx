import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmergencyNumberCard from '../components/EmergencyNumberCard';
import TechnicianCard from '../components/TechnicianCard';
import TechnicianProfile from '../components/TechnicianProfile';
import Loader from '../components/Loader';
import { useGeolocation } from '../hooks/useGeolocation';
import api from '../services/api';

export function Directory() {
  const navigate = useNavigate();
  const { location } = useGeolocation();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    async function loadDirectory() {
      try {
        const res = await api.technicians.getAll({
          lat: location.latitude,
          lng: location.longitude,
          radiusKm: 25,
        });
        if (res.success && res.data?.technicians) {
          setTechnicians(res.data.technicians);
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, [location.latitude, location.longitude]);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge-tag badge-verified" style={{ marginBottom: '0.5rem' }}>
          📋 CENTRAL CRISIS DIRECTORY
        </span>
        <h1 style={{ fontSize: '2.4rem', margin: '0.25rem 0' }}>Emergency Directory</h1>
        <p className="section-subtitle">
          Direct tap-to-call national emergency helplines and verified local emergency trades in Kolhapur.
        </p>
      </div>

      {/* 1. National Helplines */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          National Crisis Helplines (India)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <EmergencyNumberCard
            service="National All Emergency"
            number="112"
            description="Unified national 24/7 emergency dispatch"
            icon="🚨"
            color="var(--alert-red)"
          />
          <EmergencyNumberCard
            service="Fire Brigade Control"
            number="101"
            description="Structural fires, gas leaks and chemical hazards"
            icon="🔥"
            color="var(--warning)"
          />
          <EmergencyNumberCard
            service="Emergency Ambulance"
            number="108"
            description="Medical crises, electric shocks, trauma response"
            icon="🚑"
            color="var(--accent-aqua)"
          />
          <EmergencyNumberCard
            service="Police Control Room"
            number="100"
            description="Break-in incidents, safety protection, road hazard"
            icon="👮"
            color="#FFFFFF"
          />
        </div>
      </section>

      {/* 2. Verified Local Technicians Directory */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Verified Local Technicians</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Direct access without intermediaries. Pay technician directly via UPI or cash.
            </p>
          </div>
          <button className="btn-sos" onClick={() => navigate('/emergency')}>
            🚨 Launch SOS Triage
          </button>
        </div>

        {loading ? (
          <Loader label="Querying active registered technicians..." />
        ) : (
          <div className="tech-cards-grid">
            {technicians.map((tech) => (
              <TechnicianCard
                key={tech.id}
                technician={tech}
                onOpenProfile={(t) => setSelectedProfile(t)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Profile Modal */}
      {selectedProfile && (
        <TechnicianProfile
          technician={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onRequestHelp={(t) => navigate(`/emergency?category=${t.trade.toLowerCase()}`)}
        />
      )}
    </div>
  );
}

export default Directory;

