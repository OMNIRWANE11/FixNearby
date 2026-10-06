import React from 'react';
import { Link } from 'react-router-dom';

export function ServiceCard({ category }) {
  if (!category) return null;

  return (
    <div className="emergency-card">
      <div style={{ marginBottom: '1rem' }}>
        <img
          src={category.imageUrl || '/images/electrical.svg'}
          alt={`${category.name} Emergency Services`}
          loading="lazy"
          style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 className="card-title" style={{ margin: 0 }}>
          {category.icon} {category.name}
        </h3>
        <span className="badge-tag badge-verified">
          {category.technicianCount} Active
        </span>
      </div>
      <p className="card-desc">{category.description}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
        <Link to={`/emergency?category=${category.code}`} className="btn-sos" style={{ fontSize: '0.85rem' }}>
          Request SOS
        </Link>
        <Link to={`/services?category=${category.code}`} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          View Directory
        </Link>
      </div>
    </div>
  );
}

export default ServiceCard;

