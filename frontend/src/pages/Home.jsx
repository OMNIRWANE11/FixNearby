import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import TechnicianCard from '../components/TechnicianCard';
import TechnicianProfile from '../components/TechnicianProfile';
import BadgeInput from '../components/BadgeInput';
import api from '../services/api';

export function Home() {
  const navigate = useNavigate();
  const [activeTechs, setActiveTechs] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActiveTechnicians() {
      try {
        const res = await api.technicians.getAll({ onDutyOnly: true, verifiedOnly: true });
        if (res.success && res.data?.technicians) {
          setActiveTechs(res.data.technicians.slice(0, 4));
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    loadActiveTechnicians();
  }, []);

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="home-hero">
        <div className="container">
          <div className="home-hero-grid">
            <div className="hero-content">
              <span className="badge-tag badge-verified" style={{ marginBottom: '1rem' }}>
                🟢 24/7 Verified Kolhapur Emergency Network
              </span>
              <h1>
                Emergency Repair Help.<br />
                <span style={{ color: 'var(--accent-aqua)' }}>Nearby. Verified. Fast.</span>
              </h1>
              <p className="hero-subtitle">
                Find verified technicians near you for electrical, plumbing, vehicle and locksmith emergencies — with live tracking and direct contact.
              </p>

              <div className="hero-actions">
                <button
                  className="btn-sos"
                  onClick={() => navigate('/emergency')}
                  style={{ minHeight: '52px', padding: '0 2rem', fontSize: '1.05rem' }}
                >
                  🚨 SOS EMERGENCY
                </button>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/services')}
                  style={{ minHeight: '52px', padding: '0 1.75rem' }}
                >
                  🔍 FIND A TECHNICIAN
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => navigate('/verify')}
                  style={{ minHeight: '52px' }}
                >
                  🛡️ VERIFY TECHNICIAN
                </button>
              </div>

              {/* Safety Warning Strip */}
              <div
                style={{
                  background: 'rgba(255, 51, 51, 0.08)',
                  borderLeft: '4px solid var(--alert-red)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  maxWidth: '560px',
                }}
              >
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Electrical emergency?</strong> Switch off the main power breaker before approaching the fault.
                </div>
                <Link
                  to="/safety"
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--accent-aqua)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                  }}
                >
                  VIEW SAFETY GUIDES ➔
                </Link>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="hero-visual-card">
              <span className="hero-live-badge">
                <span className="status-dot"></span> PostGIS Radar Active
              </span>
              <img
                src="/images/hero-emergency.svg"
                alt="Emergency dispatch map showing citizen location and nearby active technicians"
                loading="eager"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'var(--surface-2)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Average Response</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>
                    4 – 12 Mins
                  </div>
                </div>
                <div style={{ background: 'var(--surface-2)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Trust Verification</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
                    4-Point Audit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Emergency Trades Grid */}
      <section className="container" style={{ margin: '4rem auto' }}>
        <div className="section-title-wrap">
          <h2>Immediate Crisis Response</h2>
          <p className="section-subtitle">
            Select your urgent trade category for instant dispatch to verified local pros.
          </p>
        </div>

        <div className="services-grid-4">
          <CategoryCard
            code="electrical"
            name="Electrical"
            icon="⚡"
            description="Hazardous sparking, short circuits, burning distribution panels, blown fuses and total blackouts."
            tags={['Short Circuit', 'MCB Trip', 'Wiring Fault', 'Power Failure']}
            imageUrl="/images/electrical.svg"
            activeCount={3}
          />
          <CategoryCard
            code="plumbing"
            name="Plumbing"
            icon="💧"
            description="Burst high-pressure pipes, severe wall leakages, overflowing tanks and broken isolation valves."
            tags={['Burst Pipe', 'Water Leakage', 'Tap Failure', 'Tank Issue']}
            imageUrl="/images/plumbing.svg"
            activeCount={2}
          />
          <CategoryCard
            code="automotive"
            name="Automotive"
            icon="🚗"
            description="Dead battery jumpstarts, highway tyre punctures, engine overheating, flatbed towing assistance."
            tags={['Battery Dead', 'Flat Tyre', 'Breakdown', 'Towing']}
            imageUrl="/images/automotive.svg"
            activeCount={2}
          />
          <CategoryCard
            code="locksmith"
            name="Locksmith"
            icon="🔐"
            description="Emergency residential lockout, snapped key inside tumbler, damaged latch, emergency entry."
            tags={['Door Lockout', 'Lost Keys', 'Broken Key', 'Lock Replacement']}
            imageUrl="/images/locksmith.svg"
            activeCount={2}
          />
        </div>
      </section>

      {/* 3. Live Active Technicians Nearby */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h2>Technicians Active Nearby</h2>
            <p className="section-subtitle">
              Live on-duty technicians verified within Kolhapur operating radius.
            </p>
          </div>
          <Link to="/services" className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
            View All Technicians ({activeTechs.length}+) ➔
          </Link>
        </div>

        <div className="tech-cards-grid">
          {activeTechs.map((tech) => (
            <TechnicianCard
              key={tech.id}
              technician={tech}
              onOpenProfile={(t) => setSelectedProfile(t)}
            />
          ))}
        </div>
      </section>

      {/* 4. Quick Badge Verification Card */}
      <section className="container">
        <div className="quick-badge-card">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
          <h2>Is This Technician Verified?</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Never let a technician into your home without checking their official FixNearby digital ID badge.
          </p>
          <BadgeInput onVerify={(code) => navigate(`/verify?code=${code}`)} />
        </div>
      </section>

      {/* 5. Trust Pillars */}
      <section className="trust-section">
        <div className="container">
          <div className="section-title-wrap">
            <h2>Why FixNearby Is Crisis-Safe</h2>
            <p className="section-subtitle">
              Engineered from the ground up for emergency reliability and citizen security.
            </p>
          </div>

          <div className="trust-grid">
            <div className="trust-card">
              <div style={{ fontSize: '2rem' }}>📍</div>
              <h3>LIVE GPS TRACKING</h3>
              <p>
                Track technician movement along live OSRM street routes in real time with high-precision updates.
              </p>
            </div>
            <div className="trust-card">
              <div style={{ fontSize: '2rem' }}>🛡️</div>
              <h3>4-POINT VERIFICATION</h3>
              <p>
                Strict audit of Government ID, certified trade license, address police clearance, and customer reviews.
              </p>
            </div>
            <div className="trust-card">
              <div style={{ fontSize: '2rem' }}>⚡</div>
              <h3>ZERO COMMISSION</h3>
              <p>
                Direct customer-to-technician payment via cash or UPI. No booking cuts, no middleman inflated rates.
              </p>
            </div>
            <div className="trust-card">
              <div style={{ fontSize: '2rem' }}>📶</div>
              <h3>OFFLINE READY</h3>
              <p>
                Crucial emergency safety guides and helpline numbers remain accessible even during total network outages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works Timeline */}
      <section className="container" style={{ margin: '4rem auto' }}>
        <div className="section-title-wrap">
          <h2>How FixNearby Works</h2>
          <p className="section-subtitle">From distress to resolved emergency in 4 simple steps.</p>
        </div>

        <div className="how-it-works-timeline">
          <div className="timeline-step-card">
            <div className="timeline-step-num">01</div>
            <h3>Request SOS</h3>
            <p>Select your emergency problem and transmit your GPS coordinates with one tap.</p>
          </div>
          <div className="timeline-step-card">
            <div className="timeline-step-num">02</div>
            <h3>Verify Badge</h3>
            <p>Review the assigned technician's 4-point verification credentials and photo ID.</p>
          </div>
          <div className="timeline-step-card">
            <div className="timeline-step-num">03</div>
            <h3>Live Track</h3>
            <p>Watch their vehicle progress on OpenStreetMap with real-time ETA updates.</p>
          </div>
          <div className="timeline-step-card">
            <div className="timeline-step-num">04</div>
            <h3>Direct Contact</h3>
            <p>Connect via instant phone call or automated WhatsApp location links with zero fees.</p>
          </div>
        </div>
      </section>

      {/* Technician Profile Modal */}
      {selectedProfile && (
        <TechnicianProfile
          technician={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onRequestHelp={(tech) => navigate(`/emergency?category=${tech.trade.toLowerCase()}`)}
        />
      )}
    </div>
  );
}

export default Home;

