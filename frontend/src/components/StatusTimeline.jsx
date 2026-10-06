import React from 'react';

const STATUS_STAGES = [
  { key: 'PENDING', label: 'Requested', icon: '📝' },
  { key: 'ASSIGNED', label: 'Accepted', icon: '🤝' },
  { key: 'ON_THE_WAY', label: 'On The Way', icon: '🚗' },
  { key: 'ARRIVED', label: 'Arrived', icon: '📍' },
  { key: 'COMPLETED', label: 'Completed', icon: '✅' },
];

export function StatusTimeline({ currentStatus = 'PENDING' }) {
  const getStageIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'ASSIGNED': return 1;
      case 'ON_THE_WAY': return 2;
      case 'ARRIVED': return 3;
      case 'COMPLETED': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.25rem 0', position: 'relative' }}>
      {STATUS_STAGES.map((stage, idx) => {
        const isPassed = idx <= currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isCurrent ? 'var(--accent-aqua)' : isPassed ? 'var(--surface-3)' : 'var(--surface-1)',
                border: isPassed ? '2px solid var(--accent-aqua)' : '2px solid var(--border)',
                color: isCurrent ? '#000' : isPassed ? 'var(--accent-aqua)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: isCurrent ? 'var(--accent-aqua-glow)' : 'none',
              }}
            >
              {stage.icon}
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                marginTop: '0.35rem',
                color: isCurrent ? 'var(--accent-aqua)' : isPassed ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: isCurrent ? 700 : 500,
                textAlign: 'center',
              }}
            >
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default StatusTimeline;

