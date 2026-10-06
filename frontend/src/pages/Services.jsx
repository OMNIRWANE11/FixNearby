import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TechnicianCard from '../components/TechnicianCard';
import TechnicianProfile from '../components/TechnicianProfile';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { useGeolocation } from '../hooks/useGeolocation';
import api from '../services/api';

const CATEGORY_TABS = [
  { code: 'all', label: 'All Services', icon: '🌐' },
  { code: 'electrical', label: 'Electrical', icon: '⚡' },
  { code: 'plumbing', label: 'Plumbing', icon: '💧' },
  { code: 'automotive', label: 'Automotive', icon: '🚗' },
  { code: 'locksmith', label: 'Locksmith', icon: '🔐' },
];

export function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location } = useGeolocation();

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    onDutyOnly: false,
    verifiedOnly: false,
    minRating: 0,
    radiusKm: 25,
    sort: 'nearest',
  });

  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    async function fetchTechnicians() {
      setLoading(true);
      try {
        const params = {
          category: activeCategory !== 'all' ? activeCategory : undefined,
          onDutyOnly: filters.onDutyOnly ? true : undefined,
          verifiedOnly: filters.verifiedOnly ? true : undefined,
          minRating: filters.minRating > 0 ? filters.minRating : undefined,
          radiusKm: filters.radiusKm,
          sort: filters.sort,
          search: searchTerm.trim() || undefined,
          lat: location.latitude,
          lng: location.longitude,
        };

        const res = await api.technicians.getAll(params);
        if (res.success && res.data?.technicians) {
          setTechnicians(res.data.technicians);
        }
      } catch (err) {
        setTechnicians([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTechnicians();
  }, [activeCategory, filters, searchTerm, location.latitude, location.longitude]);

  const handleTabChange = (code) => {
    setActiveCategory(code);
    if (code === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', code);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>Find Verified Help Near You</h1>
        <p className="section-subtitle">
          Search trusted technicians based on your location, service specialty, and duty availability.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs-bar" role="tablist">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.code}
            className={`cat-tab-btn ${activeCategory === tab.code ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.code)}
            role="tab"
            aria-selected={activeCategory === tab.code}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Search Header */}
      <div style={{ marginBottom: '1.5rem', maxWidth: '640px' }}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by trade, technician name, or badge code (e.g., Rajesh, FN-88492)..."
        />
      </div>

      {/* Main Layout: Filter Sidebar + Tech Grid */}
      <div className="services-page-layout">
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
        />

        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{technicians.length}</strong> available technicians in Kolhapur
            </span>
          </div>

          {loading ? (
            <Loader label="Searching verified technicians in your sector..." />
          ) : technicians.length === 0 ? (
            <EmptyState
              title="No technicians match your filters"
              description="Try expanding the search radius or resetting rating filters to view more technicians."
              actionLabel="Reset Filters"
              onAction={() => {
                setActiveCategory('all');
                setSearchTerm('');
                setFilters({
                  onDutyOnly: false,
                  verifiedOnly: false,
                  minRating: 0,
                  radiusKm: 25,
                  sort: 'nearest',
                });
              }}
            />
          ) : (
            <div className="tech-cards-grid">
              {technicians.map((tech) => (
                <TechnicianCard
                  key={tech.id}
                  technician={tech}
                  onOpenProfile={(t) => setSelectedProfile(t)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Technician Profile Modal */}
      {selectedProfile && (
        <TechnicianProfile
          technician={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}

export default Services;

