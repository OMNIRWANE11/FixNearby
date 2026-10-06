import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create custom high-contrast SVG divIcons for User and Technician markers
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="width:24px;height:24px;background:#FF3333;border:3px solid #FFFFFF;border-radius:50%;box-shadow:0 0 12px #FF3333;"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const technicianIcon = L.divIcon({
  className: 'custom-tech-marker',
  html: `<div style="width:28px;height:28px;background:#00F0FF;border:3px solid #121212;border-radius:50%;box-shadow:0 0 14px #00F0FF;display:flex;align-items:center;justify-content:center;font-size:14px;color:#000;font-weight:900;">⚡</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Helper component to auto-pan and fit bounds
function MapBoundsUpdater({ userLocation, techLocation, routeCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (userLocation && techLocation) {
      const bounds = L.latLngBounds([
        [userLocation.latitude, userLocation.longitude],
        [techLocation.latitude, techLocation.longitude],
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 14);
    }
  }, [userLocation, techLocation, routeCoordinates, map]);

  return null;
}

export function MapView({
  userLocation,
  technicianLocation = null,
  routeCoordinates = null,
  technicians = [],
  onSelectTechnician = null,
  height = '100%',
  zoom = 13,
}) {
  const defaultCenter = [
    userLocation?.latitude || 16.7050,
    userLocation?.longitude || 74.2433,
  ];

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-tile-layer"
        />

        {/* User / Incident Marker */}
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
            <Popup>
              <strong>Emergency Location</strong>
              <br />
              {userLocation.address || 'Reported Coordinates'}
            </Popup>
          </Marker>
        )}

        {/* Active Assigned Technician Marker */}
        {technicianLocation && (
          <Marker
            position={[technicianLocation.latitude, technicianLocation.longitude]}
            icon={technicianIcon}
          >
            <Popup>
              <strong>{technicianLocation.name || 'Technician'}</strong>
              <br />
              {technicianLocation.trade || 'On the way'}
            </Popup>
          </Marker>
        )}

        {/* Nearby Active Technicians Markers (for Directory / Map Discovery) */}
        {technicians &&
          technicians.map((t) => (
            <Marker
              key={t.id}
              position={[t.currentLatitude, t.currentLongitude]}
              icon={technicianIcon}
              eventHandlers={{
                click: () => onSelectTechnician && onSelectTechnician(t),
              }}
            >
              <Popup>
                <strong>{t.name}</strong>
                <br />
                {t.trade} ({t.badgeCode})
                <br />
                ⭐ {t.rating} • {t.isVerified ? 'Verified' : 'Pending'}
              </Popup>
            </Marker>
          ))}

        {/* OSRM Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#00F0FF"
            weight={5}
            opacity={0.85}
            dashArray="1, 8"
            lineCap="round"
          />
        )}

        <MapBoundsUpdater
          userLocation={userLocation}
          techLocation={technicianLocation}
          routeCoordinates={routeCoordinates}
        />
      </MapContainer>
    </div>
  );
}

export default MapView;

