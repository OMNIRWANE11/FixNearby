import React from 'react';

export function SeverityCard({ level, label, description, icon, isSelected, onSelect }) {
  const levelClass = level.toLowerCase();

  return (
    <div
      className={`severity-card ${levelClass} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(level)}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(level);
        }
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{label}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{description}</p>
    </div>
  );
}

export default SeverityCard;

