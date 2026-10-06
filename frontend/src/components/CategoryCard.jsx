import React from 'react';
import { useNavigate } from 'react-router-dom';

export function CategoryCard({ code, name, icon, description, tags = [], imageUrl, activeCount }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/emergency?category=${code}`);
  };

  return (
    <div
      className="emergency-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Emergency service for ${name}`}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className="card-icon">{icon}</span>
          <span className="badge-tag badge-verified">
            {activeCount != null ? `${activeCount} On Duty` : 'Verified On Duty'}
          </span>
        </div>
        <h3 className="card-title">{name}</h3>
        <p className="card-desc">{description}</p>
        
        {tags && tags.length > 0 && (
          <div className="card-tags">
            {tags.map((tag, idx) => (
              <span key={idx} className="card-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button
          className="btn-primary"
          style={{ width: '100%' }}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          Find Help Now ➔
        </button>
      </div>
    </div>
  );
}

export default CategoryCard;

