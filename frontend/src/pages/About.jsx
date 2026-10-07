import React from 'react';
import { Link } from 'react-router-dom';

const TEAM = [
  {
    name: 'Om Nirwane',
    role: 'Lead Full-Stack Architect',
    bio: 'Specialist in high-concurrency Flask APIs, PostGIS spatial algorithms, and crisis-response architectures.',
    tag: 'Project Core / Demo Member'
  },
  {
    name: 'Shreyas Parit',
    role: 'Senior Geospatial & UI/UX Designer',
    bio: 'Dedicated to high-contrast, crisis-optimized UI design systems and real-time Leaflet tracking experiences.',
    tag: 'Design Lead / Demo Member'
  },
  {
    name: 'Ritesh Patil',
    role: 'Distributed Systems & PostGIS Engineer',
    bio: 'Optimized spatial indexing, GeoAlchemy queries, and OSRM autonomous routing pipelines.',
    tag: 'Backend Lead / Demo Member'
  },
  {
    name: 'Tanishq Patil',
    role: 'PWA & Resilience Specialist',
    bio: 'Built service worker offline fallbacks, telemetry simulation, and WCAG AA accessibility compliance.',
    tag: 'PWA Engineer / Demo Member'
  }
];

export function About() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '960px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="badge-tag badge-verified" style={{ marginBottom: '0.75rem' }}>
          ARCHITECTURAL SPECIFICATION & MISSION
        </span>
        <h1 style={{ fontSize: '2.6rem', marginBottom: '0.5rem' }}>
          About FixNearby
        </h1>
        <p className="section-subtitle" style={{ maxWidth: '680px', margin: '0 auto' }}>
          A crisis-first, hyper-local technician discovery and direct contact marketplace engineered for maximum speed, security, and offline resilience.
        </p>
      </div>

      {/* 1. Core Mission */}
      <section style={{ marginBottom: '3rem', background: 'var(--surface-1)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--accent-aqua)' }}>Our Mission</h2>
        <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
          When a circuit breaker bursts into flames at midnight or a municipal pipe ruptures inside a home, every second counts. Citizens cannot wait for generic gig-economy platforms with lengthy quotation delays, upfront booking fees, and opaque background verification.
        </p>
        <p style={{ lineHeight: '1.7' }}>
          <strong>FixNearby</strong> eliminates the middleman. We connect citizens directly to verified, licensed local technicians within seconds, displaying live GPS tracking, automated WhatsApp location coordinates, and a rigorous 4-point verification badge check.
        </p>
      </section>

      {/* 2. Key Pillars */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Architectural Highlights</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="trust-card">
            <h3>🌐 Open Geospatial Stack</h3>
            <p>
              Built using PostgreSQL, PostGIS spatial GIST indexes, OpenStreetMap raster tiles, and the OSRM open routing engine. Fully independent from proprietary map APIs.
            </p>
          </div>
          <div className="trust-card">
            <h3>🛡️ 4-Point Safety Audit</h3>
            <p>
              Every verified badge code requires passing government photo ID matching, trade certification licensing, physical address police verification, and a 4.0+ customer trust rating.
            </p>
          </div>
          <div className="trust-card">
            <h3>⚡ Zero Commission</h3>
            <p>
              100% direct payment between customer and technician via Cash or UPI. No booking commissions, subscriptions, or artificially inflated technician rates.
            </p>
          </div>
          <div className="trust-card">
            <h3>📶 Progressive Web App</h3>
            <p>
              Service Worker caching ensures emergency numbers and safety crisis guides remain accessible even when cellular towers or internet connectivity fails.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Tech Stack */}
      <section style={{ marginBottom: '3.5rem', background: 'var(--surface-1)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>Technology Stack</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.95rem' }}>
          <div>
            <h4 style={{ color: 'var(--accent-aqua)', marginBottom: '0.5rem' }}>Frontend</h4>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
              <li>React 18 & Vite</li>
              <li>React Router v6</li>
              <li>Leaflet 1.9.4 & react-leaflet</li>
              <li>Custom Obsidian CSS Variables</li>
              <li>PWA Service Worker</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-aqua)', marginBottom: '0.5rem' }}>Backend</h4>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
              <li>Python 3.11+ & Flask</li>
              <li>Flask Blueprints & Flask-SocketIO</li>
              <li>Flask-JWT-Extended & bcrypt</li>
              <li>Marshmallow & Flask-Limiter</li>
              <li>OSRM Open Routing API</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-aqua)', marginBottom: '0.5rem' }}>Database & Spatial</h4>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
              <li>PostgreSQL 15+</li>
              <li>PostGIS Geography Points</li>
              <li>ST_DWithin & ST_Distance</li>
              <li>GIST Spatial Indexing</li>
              <li>SQLAlchemy & Alembic</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Engineering Team Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Engineering & Project Team</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Project demonstration members and software engineering specialists.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {TEAM.map((member, idx) => (
            <div key={idx} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-2)', border: '2px solid var(--accent-aqua)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, marginBottom: '0.75rem' }}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>{member.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', marginBottom: '0.5rem' }}>{member.role}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{member.bio}</p>
              <span className="badge-tag" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                {member.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h2>Ready for Instant Emergency Help?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Find the nearest verified technician in Kolhapur right now.
        </p>
        <Link to="/emergency" className="btn-sos" style={{ display: 'inline-flex', padding: '0 2rem' }}>
          🚨 Launch SOS Emergency
        </Link>
      </div>
    </div>
  );
}

export default About;

