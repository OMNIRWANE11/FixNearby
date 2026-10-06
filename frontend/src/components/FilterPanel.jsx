import React from 'react';

export function FilterPanel({ filters, onFilterChange, categories = [] }) {
  return (
    <aside className="filter-sidebar" aria-label="Technician Directory Filters">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Filters</h3>
        <button
          type="button"
          onClick={() =>
            onFilterChange({
              category: 'all',
              onDutyOnly: false,
              verifiedOnly: false,
              minRating: 0,
              radiusKm: 25,
              sort: 'nearest',
            })
          }
          style={{ background: 'transparent', color: 'var(--accent-aqua)', fontSize: '0.8rem', padding: 0, minHeight: 'auto' }}
        >
          Reset All
        </button>
      </div>

      {/* Sort Option */}
      <div className="filter-group">
        <label htmlFor="filter-sort">Sort Technicians</label>
        <select
          id="filter-sort"
          value={filters.sort || 'nearest'}
          onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
        >
          <option value="nearest">Nearest Proximity (GPS)</option>
          <option value="rating">Highest Rated</option>
          <option value="eta">Fastest Arrival (ETA)</option>
          <option value="experience">Most Experienced</option>
        </select>
      </div>

      {/* Operating Radius */}
      <div className="filter-group">
        <label htmlFor="filter-radius">Search Radius ({filters.radiusKm || 25} km)</label>
        <select
          id="filter-radius"
          value={filters.radiusKm || 25}
          onChange={(e) => onFilterChange({ ...filters, radiusKm: Number(e.target.value) })}
        >
          <option value="1">Within 1 km (Immediate walking)</option>
          <option value="3">Within 3 km</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="25">Within 25 km (Kolhapur metro)</option>
          <option value="50">Within 50 km (Regional)</option>
        </select>
      </div>

      {/* Minimum Rating */}
      <div className="filter-group">
        <label htmlFor="filter-rating">Minimum Trust Rating</label>
        <select
          id="filter-rating"
          value={filters.minRating || 0}
          onChange={(e) => onFilterChange({ ...filters, minRating: Number(e.target.value) })}
        >
          <option value="0">All Ratings</option>
          <option value="4.0">⭐ 4.0 & above (Standard)</option>
          <option value="4.5">⭐ 4.5 & above (Top Rated)</option>
          <option value="4.8">⭐ 4.8 & above (Elite)</option>
        </select>
      </div>

      {/* Toggles */}
      <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
          <input
            type="checkbox"
            checked={!!filters.onDutyOnly}
            onChange={(e) => onFilterChange({ ...filters, onDutyOnly: e.target.checked })}
            style={{ width: '20px', minHeight: 'auto', accentColor: 'var(--accent-aqua)' }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>🟢 On Duty Only</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
          <input
            type="checkbox"
            checked={!!filters.verifiedOnly}
            onChange={(e) => onFilterChange({ ...filters, verifiedOnly: e.target.checked })}
            style={{ width: '20px', minHeight: 'auto', accentColor: 'var(--accent-aqua)' }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>🛡️ 4-Point Verified Only</span>
        </label>
      </div>
    </aside>
  );
}

export default FilterPanel;

