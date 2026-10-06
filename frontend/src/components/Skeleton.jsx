import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = '6px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function TechnicianCardSkeleton() {
  return (
    <div className="tech-card">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Skeleton width="68px" height="68px" borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton width="60%" height="20px" />
          <Skeleton width="40%" height="16px" />
        </div>
      </div>
      <Skeleton width="100%" height="56px" borderRadius="10px" />
      <Skeleton width="100%" height="42px" borderRadius="8px" />
    </div>
  );
}

export default Skeleton;

