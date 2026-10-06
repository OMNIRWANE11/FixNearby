import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const pickerIcon = L.divIcon({
  className: 'custom-picker-marker',
  html: `<div style="width:26px;height:26px;background:#00F0FF;border:3px solid #121212;border-radius:50%;box-shadow:0 0 12px #00F0FF;display:flex;align-items:center;justify-content:center;font-size:12px;color:#000;">📍</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ location, onLocationChange, onGpsRequest, gpsStatus }) {
  const [addressInput, setAddressInput] = useState(location?.address || '');

  useEffect(() => {
    if (location?.address) {
      setAddressInput(location.address);
    }
  }, [location?.address]);

  const handleMapClick = (lat, lng) => {
    onLocationChange({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      address: addressInput || 'Manually selected on map',
    });
  };

  const handleAddressBlur = () => {
    onLocationChange({
      ...location,
      address: addressInput,
    });
  };

  return (
    <div>
      {/* Geolocation Trigger & Status */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={onGpsRequest}
          className="btn-primary"
          style={{ flexGrow: 1 }}
        >
          {gpsStatus === 'loading' ? 'Acquiring GPS Signal...' : '🎯 USE MY CURRENT GPS LOCATION'}
        </button>
      </div>

      {/* Accuracy & Coords Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--surface-2)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Coordinates: </span>
          <span style={{ color: 'var(--accent-aqua)', fontFamily: 'monospace' }}>
            {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>GPS Accuracy: </span>
          <span>{location?.accuracy ? `±${location.accuracy} meters` : 'Approximate'}</span>
        </div>
      </div>

      {/* Manual Address Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
          Detailed Building / Flat / Landmark Address:
        </label>
        <input
          type="text"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onBlur={handleAddressBlur}
          placeholder="e.g., Flat 402, Royal Palms, Shahupuri 2nd Lane, Kolhapur"
        />
      </div>

      {/* Interactive Leaflet Pin Picker */}
      <div className="map-picker-container">
        <MapContainer
          center={[location?.latitude || 16.7050, location?.longitude || 74.2433]}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-tile-layer"
          />
          {location?.latitude && location?.longitude && (
            <Marker
              position={[location.latitude, location.longitude]}
              icon={pickerIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  handleMapClick(pos.lat, pos.lng);
                },
              }}
            />
          )}
          <MapClickHandler onLocationSelect={handleMapClick} />
        </MapContainer>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
        💡 Tip: Tap anywhere on the map or drag the aqua pin to fine-tune your exact location.
      </p>
    </div>
  );
}

export default LocationPicker;

