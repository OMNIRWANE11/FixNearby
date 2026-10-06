import React from 'react';

export function RatingStars({ rating = 5.0, count = null }) {
  const rounded = Math.round(rating * 10) / 10;
  const fullStars = Math.floor(rounded);

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
      aria-label={`Rating: ${rounded} out of 5 stars`}
    >
      <div style={{ color: '#FFB020', display: 'flex', gap: '2px', fontSize: '1rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= fullStars ? '★' : '☆'}
          </span>
        ))}
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
        {rounded.toFixed(1)}
      </span>
      {count != null && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ({count})
        </span>
      )}
    </div>
  );
}

export default RatingStars;

