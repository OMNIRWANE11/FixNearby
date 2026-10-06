import React from 'react';

export function SearchBar({ value, onChange, placeholder = 'Search service or technician...' }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: '2.75rem' }}
        aria-label="Search technicians"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: '0.25rem',
            minHeight: 'auto',
          }}
          aria-label="Clear Search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;

