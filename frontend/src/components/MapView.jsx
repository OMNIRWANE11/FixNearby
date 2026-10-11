import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatDistance, formatEta } from '../utils/formatters';
import { getTelLink } from '../utils/contactLinks';

// High-resolution, watermark-free map styles (No API key required)
const TILE_STYLES = {
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    icon: '🌙',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    className: 'map-tiles-dark',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  streets: {
    id: 'streets',
    name: 'Street View',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    className: 'map-tiles-streets',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    className: 'map-tiles-satellite',
    attribution: '&copy; Esri &mdash; Earthstar Geographics',
    maxZoom: 18,
  },
};

// Factory for User / Emergency Destination marker
const createUserIcon = (label = 'Your Location') => {
  return L.divIcon({
    className: 'map-marker-wrap',
    html: `
      <div class="marker-radar-ring user-ring"></div>
      <div class="marker-core-disc user-disc" title="Incident Location">📍</div>
      <div class="marker-floating-chip user-chip">
        <span>${label}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Factory for Technician live marker with radar glow and floating status tag
const createTechIcon = (techName = 'Technician', etaMinutes = null) => {
  const etaBadge = etaMinutes ? `<span class="marker-chip-badge">${formatEta(etaMinutes)}</span>` : '';
  return L.divIcon({
    className: 'map-marker-wrap',
    html: `
      <div class="marker-radar-ring tech-ring"></div>
      <div class="marker-core-disc tech-disc" title="${techName}">⚡</div>
      <div class="marker-floating-chip tech-chip">
        <span>${techName}</span>
        ${etaBadge}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Helper component for auto-centering and bounds fitting
function MapBoundsUpdater({ userLocation, techLocation, routeCoordinates, initialFitDone, setInitialFitDone }) {
  const map = useMap();

  useEffect(() => {
    if (initialFitDone) return;

    if (routeCoordinates && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      setInitialFitDone(true);
    } else if (userLocation && techLocation) {
      const bounds = L.latLngBounds([
        [userLocation.latitude, userLocation.longitude],
        [techLocation.latitude, techLocation.longitude],
      ]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
      setInitialFitDone(true);
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 14);
      setInitialFitDone(true);
    }
  }, [userLocation, techLocation, routeCoordinates, map, initialFitDone, setInitialFitDone]);

  return null;
}

// Floating interactive controllers component that interacts directly with the Leaflet map instance
function MapFloatingControls({
  userLocation,
  techLocation,
  routeCoordinates,
  activeTheme,
  onToggleTheme,
}) {
  const map = useMap();

  const handleCenterTech = () => {
    if (techLocation) {
      map.flyTo([techLocation.latitude, techLocation.longitude], 16, { duration: 0.9 });
    }
  };

  const handleCenterUser = () => {
    if (userLocation) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 16, { duration: 0.9 });
    }
  };

  const handleFitRoute = () => {
    if (routeCoordinates && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (userLocation && techLocation) {
      const bounds = L.latLngBounds([
        [userLocation.latitude, userLocation.longitude],
        [techLocation.latitude, techLocation.longitude],
      ]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
    } else if (userLocation) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 14, { duration: 0.9 });
    }
  };

  return (
    <div className="map-action-toolbar" aria-label="Map Navigation Tools">
      {techLocation && (
        <button
          type="button"
          className="map-tool-btn"
          onClick={handleCenterTech}
          data-tooltip="Center on Technician"
          aria-label="Center on Technician"
        >
          ⚡
        </button>
      )}

      {userLocation && (
        <button
          type="button"
          className="map-tool-btn"
          onClick={handleCenterUser}
          data-tooltip="My Emergency Location"
          aria-label="My Emergency Location"
        >
          📍
        </button>
      )}

      {(routeCoordinates?.length > 1 || (userLocation && techLocation)) && (
        <button
          type="button"
          className="map-tool-btn"
          onClick={handleFitRoute}
          data-tooltip="Fit Whole Route"
          aria-label="Fit Whole Route"
        >
          🗺️
        </button>
      )}

      <button
        type="button"
        className="map-tool-btn"
        onClick={onToggleTheme}
        data-tooltip={`Switch Map (${TILE_STYLES[activeTheme].name})`}
        aria-label="Switch Map Style"
      >
        {TILE_STYLES[activeTheme].icon}
      </button>

      <button
        type="button"
        className="map-tool-btn"
        onClick={() => map.zoomIn()}
        data-tooltip="Zoom In"
        aria-label="Zoom In"
      >
        ＋
      </button>

      <button
        type="button"
        className="map-tool-btn"
        onClick={() => map.zoomOut()}
        data-tooltip="Zoom Out"
        aria-label="Zoom Out"
      >
        －
      </button>
    </div>
  );
}

export function MapView({
  userLocation,
  technicianLocation = null,
  routeCoordinates = null,
  technicians = [],
  onSelectTechnician = null,
  etaMinutes = null,
  distanceRemainingKm = null,
  status = null,
  height = '100%',
  zoom = 13,
}) {
  const [activeTheme, setActiveTheme] = useState('dark');
  const [initialFitDone, setInitialFitDone] = useState(false);

  // Cycle themes: dark -> streets -> satellite -> dark
  const handleToggleTheme = () => {
    setActiveTheme((prev) => {
      if (prev === 'dark') return 'streets';
      if (prev === 'streets') return 'satellite';
      return 'dark';
    });
  };

  const defaultCenter = useMemo(() => [
    userLocation?.latitude || 16.7050,
    userLocation?.longitude || 74.2433,
  ], [userLocation]);

  const userMarkerIcon = useMemo(() => {
    return createUserIcon(userLocation?.name || 'Your Location');
  }, [userLocation?.name]);

  const techMarkerIcon = useMemo(() => {
    return createTechIcon(
      technicianLocation?.name || 'Technician',
      etaMinutes
    );
  }, [technicianLocation?.name, etaMinutes]);

  const tileConfig = TILE_STYLES[activeTheme] || TILE_STYLES.dark;

  return (
    <div className="map-view-container" style={{ height }}>
      {/* 1. Live Top HUD Pill (Quick at-a-glance status) */}
      {(technicianLocation || userLocation) && (
        <div
          className="map-top-hud"
          title="Click to view full route"
          onClick={() => setInitialFitDone(false)}
        >
          <div className="map-hud-live-dot" />
          {status === 'ARRIVED' ? (
            <div className="map-hud-stat">
              🚨 <strong>Technician has arrived!</strong>
            </div>
          ) : technicianLocation ? (
            <div className="map-hud-stat">
              <span>{technicianLocation.name || 'Technician'}</span>
              <span>•</span>
              <strong>{distanceRemainingKm ? formatDistance(distanceRemainingKm) : 'On the way'}</strong>
              {etaMinutes ? <span>• ETA <strong>{formatEta(etaMinutes)}</strong></span> : null}
            </div>
          ) : (
            <div className="map-hud-stat">
              <span>Emergency Location:</span>
              <strong>{userLocation?.address || 'Kolhapur, MH'}</strong>
            </div>
          )}
        </div>
      )}

      {/* 2. Interactive Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false} /* Replaced by sleek custom floating toolbar */
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          key={tileConfig.id}
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          className={tileConfig.className || ''}
          maxZoom={tileConfig.maxZoom || 19}
        />

        {/* 3. High-Contrast Dual-Layer Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <>
            {/* Outer Glow / Casing */}
            <Polyline
              positions={routeCoordinates}
              color="#00F0FF"
              weight={9}
              opacity={0.3}
              lineCap="round"
              lineJoin="round"
            />
            {/* Core Vibrant Route Line */}
            <Polyline
              positions={routeCoordinates}
              color="#00F0FF"
              weight={4.5}
              opacity={0.95}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

        {/* 4. Customer / Emergency Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userMarkerIcon}
          >
            <Popup>
              <div className="map-popup-card">
                <div className="map-popup-header">
                  <div style={{ fontSize: '1.5rem' }}>📍</div>
                  <div>
                    <h4 className="map-popup-title">Incident Location</h4>
                    <p className="map-popup-sub">{userLocation.name || 'Emergency Destination'}</p>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '4px' }}>
                  {userLocation.address || 'Reported GPS Location'}
                </div>
                {userLocation.phone && (
                  <div className="map-popup-meta">
                    <span>Contact: {userLocation.phone}</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* 5. Assigned Live Technician Marker */}
        {technicianLocation && (
          <Marker
            position={[technicianLocation.latitude, technicianLocation.longitude]}
            icon={techMarkerIcon}
          >
            <Popup>
              <div className="map-popup-card">
                <div className="map-popup-header">
                  {technicianLocation.profileImageUrl ? (
                    <img
                      src={technicianLocation.profileImageUrl}
                      alt={technicianLocation.name}
                      className="map-popup-avatar"
                    />
                  ) : (
                    <div className="marker-core-disc tech-disc" style={{ width: 36, height: 36 }}>⚡</div>
                  )}
                  <div>
                    <h4 className="map-popup-title">{technicianLocation.name || 'Technician'}</h4>
                    <p className="map-popup-sub">{technicianLocation.trade || 'Emergency Specialist'}</p>
                  </div>
                </div>
                <div className="map-popup-meta">
                  <span>Speed: ~32 km/h</span>
                  {technicianLocation.phone && (
                    <a
                      href={getTelLink(technicianLocation.phone)}
                      style={{ color: '#00F0FF', fontWeight: 700, textDecoration: 'none' }}
                    >
                      📞 Call Direct
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 6. Multiple Technicians (Directory / Discovery Map Mode) */}
        {technicians &&
          technicians.map((t) => (
            <Marker
              key={t.id}
              position={[t.currentLatitude, t.currentLongitude]}
              icon={createTechIcon(t.name || t.trade)}
              eventHandlers={{
                click: () => onSelectTechnician && onSelectTechnician(t),
              }}
            >
              <Popup>
                <div className="map-popup-card">
                  <div className="map-popup-header">
                    <img
                      src={t.profileImageUrl || '/images/technicians/tech-default.svg'}
                      alt={t.name}
                      className="map-popup-avatar"
                    />
                    <div>
                      <h4 className="map-popup-title">{t.name}</h4>
                      <p className="map-popup-sub">{t.trade} ({t.badgeCode})</p>
                    </div>
                  </div>
                  <div className="map-popup-meta">
                    <span>⭐ {t.rating} ({t.jobsCompleted || 0} jobs)</span>
                    <span style={{ color: t.isVerified ? '#00F0FF' : '#ff4d4d' }}>
                      {t.isVerified ? '✓ Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 7. Auto Bounds Updater */}
        <MapBoundsUpdater
          userLocation={userLocation}
          techLocation={technicianLocation}
          routeCoordinates={routeCoordinates}
          initialFitDone={initialFitDone}
          setInitialFitDone={setInitialFitDone}
        />

        {/* 8. Modern Floating Controls (Center, Fit, Theme Switcher, Zoom) */}
        <MapFloatingControls
          userLocation={userLocation}
          techLocation={technicianLocation}
          routeCoordinates={routeCoordinates}
          activeTheme={activeTheme}
          onToggleTheme={handleToggleTheme}
        />
      </MapContainer>

      {/* 9. Bottom subtle telemetry pill */}
      <div className="map-bottom-info">
        <span>🛰️ OSRM Navigation Active</span>
        <span>•</span>
        <span>Style: {tileConfig.name}</span>
      </div>
    </div>
  );
}

export default MapView;
