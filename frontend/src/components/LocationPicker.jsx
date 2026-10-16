import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGeolocation } from '../hooks/useGeolocation';

// Prominent Kolhapur areas, landmarks, and hubs for instant zero-latency matching
const KOLHAPUR_LANDMARKS = [
  { name: 'Rankala Lake', address: 'Rankala Lake, Kolhapur', lat: 16.6895, lng: 74.2185, icon: '🌊', type: 'Landmark' },
  { name: 'Mahalaxmi Temple (Ambabai)', address: 'Mahadwar Road, B Ward, Kolhapur', lat: 16.6946, lng: 74.2238, icon: '🛕', type: 'Temple' },
  { name: 'Bhavani Mandap', address: 'Bhavani Mandap, Old City, Kolhapur', lat: 16.6940, lng: 74.2230, icon: '🏛️', type: 'Heritage' },
  { name: 'Shahupuri', address: 'Shahupuri, Kolhapur', lat: 16.7020, lng: 74.2410, icon: '📍', type: 'Commercial Hub' },
  { name: 'Shahupuri 1st Lane', address: 'Shahupuri 1st Lane, Kolhapur', lat: 16.7030, lng: 74.2415, icon: '📍', type: 'Area' },
  { name: 'Shahupuri 2nd Lane', address: 'Shahupuri 2nd Lane, Kolhapur', lat: 16.7025, lng: 74.2410, icon: '📍', type: 'Area' },
  { name: 'Shahupuri 3rd Lane', address: 'Shahupuri 3rd Lane, Kolhapur', lat: 16.7018, lng: 74.2405, icon: '📍', type: 'Area' },
  { name: 'Shahupuri 4th Lane', address: 'Shahupuri 4th Lane, Kolhapur', lat: 16.7010, lng: 74.2400, icon: '📍', type: 'Area' },
  { name: 'Rajarampuri', address: 'Rajarampuri Main Road, Kolhapur', lat: 16.6912, lng: 74.2488, icon: '🛍️', type: 'Commercial' },
  { name: 'Rajarampuri 1st Lane', address: 'Rajarampuri 1st Lane, Kolhapur', lat: 16.6925, lng: 74.2470, icon: '📍', type: 'Area' },
  { name: 'Rajarampuri 5th Lane', address: 'Rajarampuri 5th Lane, Kolhapur', lat: 16.6940, lng: 74.2490, icon: '📍', type: 'Area' },
  { name: 'Rajarampuri 9th Lane', address: 'Rajarampuri 9th Lane, Kolhapur', lat: 16.6960, lng: 74.2510, icon: '📍', type: 'Area' },
  { name: 'Tarabai Park', address: 'Tarabai Park, Kolhapur', lat: 16.7115, lng: 74.2380, icon: '🏡', type: 'Residential' },
  { name: 'Nagala Park', address: 'Nagala Park, Kolhapur', lat: 16.7135, lng: 74.2325, icon: '🏡', type: 'Residential' },
  { name: 'Kawala Naka', address: 'Kawala Naka Chowk, Kolhapur', lat: 16.7078, lng: 74.2546, icon: '🚦', type: 'Junction' },
  { name: 'Central Bus Stand (CBS)', address: 'CBS Station Road, Kolhapur', lat: 16.7042, lng: 74.2431, icon: '🚌', type: 'Transit Hub' },
  { name: 'CSMT Railway Station', address: 'Chhatrapati Shahu Maharaj Terminus, Kolhapur', lat: 16.7015, lng: 74.2425, icon: '🚆', type: 'Railway' },
  { name: 'Shivaji University', address: 'Vidyanagar, Old Pune-Bangalore Rd, Kolhapur', lat: 16.6775, lng: 74.2550, icon: '🎓', type: 'Campus' },
  { name: 'Laxmipuri', address: 'Laxmipuri Vegetable Market, Kolhapur', lat: 16.6985, lng: 74.2320, icon: '🛒', type: 'Market' },
  { name: 'New Palace (Shahu Museum)', address: 'Bhavani Chowk, Raman Mala, Kolhapur', lat: 16.7210, lng: 74.2280, icon: '🏰', type: 'Palace' },
  { name: 'Kasaba Bawada', address: 'Kasaba Bawada, Kolhapur', lat: 16.7320, lng: 74.2450, icon: '📍', type: 'Area' },
  { name: 'Gandhinagar', address: 'Gandhinagar Wholesale Market, Kolhapur', lat: 16.7150, lng: 74.2820, icon: '🏬', type: 'Wholesale' },
  { name: 'Ruikar Colony', address: 'Ruikar Colony, Kolhapur', lat: 16.7090, lng: 74.2490, icon: '🏡', type: 'Colony' },
  { name: 'Uchgaon', address: 'Uchgaon, Kolhapur', lat: 16.6850, lng: 74.2750, icon: '📍', type: 'Area' },
  { name: 'Shiroli MIDC', address: 'Shiroli Industrial Area, Kolhapur', lat: 16.7450, lng: 74.2850, icon: '🏭', type: 'Industrial' },
  { name: 'Gokul Shirgaon MIDC', address: 'Gokul Shirgaon Industrial Estate, Kolhapur', lat: 16.6400, lng: 74.2750, icon: '🏭', type: 'Industrial' },
  { name: 'Kadamwadi', address: 'Kadamwadi, Kolhapur', lat: 16.7140, lng: 74.2550, icon: '📍', type: 'Area' },
  { name: 'Pratibha Nagar', address: 'Pratibha Nagar, Kolhapur', lat: 16.6870, lng: 74.2390, icon: '🏡', type: 'Colony' },
  { name: 'Mangalwar Peth', address: 'Mangalwar Peth, Kolhapur', lat: 16.6920, lng: 74.2290, icon: '📍', type: 'Peth' },
  { name: 'Somwar Peth', address: 'Somwar Peth, Kolhapur', lat: 16.6950, lng: 74.2260, icon: '📍', type: 'Peth' },
  { name: 'Raviwar Peth', address: 'Raviwar Peth, Kolhapur', lat: 16.6960, lng: 74.2300, icon: '📍', type: 'Peth' },
  { name: 'Shaniwar Peth', address: 'Shaniwar Peth, Kolhapur', lat: 16.6990, lng: 74.2240, icon: '📍', type: 'Peth' },
  { name: 'Shukrawar Peth', address: 'Shukrawar Peth, Kolhapur', lat: 16.6910, lng: 74.2250, icon: '📍', type: 'Peth' },
  { name: 'CPR Hospital Kolhapur', address: 'Chhatrapati Pramila Raje Hospital, Kolhapur', lat: 16.6975, lng: 74.2285, icon: '🏥', type: 'Hospital' },
  { name: 'DY Patil Hospital', address: 'DY Patil Hospital & Medical College, Kadamwadi, Kolhapur', lat: 16.7180, lng: 74.2510, icon: '🏥', type: 'Hospital' },
  { name: 'Shalini Palace', address: 'Rankala Chaupati, Kolhapur', lat: 16.6880, lng: 74.2150, icon: '🏰', type: 'Heritage' },
];

const pickerIcon = L.divIcon({
  className: 'map-marker-wrap',
  html: `
    <div class="marker-radar-ring user-ring"></div>
    <div class="marker-core-disc user-disc" style="width:34px;height:34px;cursor:grab;" title="Drag or Click to set">📍</div>
    <div class="marker-floating-chip user-chip">
      <span>Pinned Location</span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapFlyController({ targetCoords }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords?.latitude && targetCoords?.longitude) {
      map.flyTo([targetCoords.latitude, targetCoords.longitude], 15, {
        duration: 0.9,
        easeLinearity: 0.25,
      });
    }
  }, [targetCoords?.latitude, targetCoords?.longitude, map]);
  return null;
}

export function LocationPicker({
  location,
  onLocationChange,
  onGpsRequest,
  gpsStatus,
  addressLabel = 'Detailed Street Address / Landmark:',
  mapHeight = '320px',
  hint = 'Type any location above to automatically point the map, or tap/drag the pin anywhere.',
  buttonText = 'USE MY CURRENT GPS LOCATION',
}) {
  const geo = useGeolocation();
  const effectiveGpsRequest = onGpsRequest || geo.requestGpsLocation;
  const effectiveGpsStatus = gpsStatus || geo.gpsStatus;

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatusState, setGpsStatusState] = useState(gpsStatus || 'prompt');

  const [addressInput, setAddressInput] = useState(location?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [pinnedFeedback, setPinnedFeedback] = useState(null);
  const [flyTarget, setFlyTarget] = useState(
    location?.latitude && location?.longitude
      ? { latitude: location.latitude, longitude: location.longitude }
      : { latitude: 16.7050, longitude: 74.2433 }
  );

  const searchTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync addressInput if parent location changes externally
  useEffect(() => {
    if (location?.address !== undefined && location.address !== addressInput) {
      setAddressInput(location.address || '');
    }
    if (location?.latitude && location?.longitude) {
      setFlyTarget({ latitude: location.latitude, longitude: location.longitude });
    }
  }, [location?.address, location?.latitude, location?.longitude]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Point map directly to coordinates and notify parent
  const pointMapToCoordinates = (lat, lng, addressText, labelName = null) => {
    const cleanLat = Number(Number(lat).toFixed(6));
    const cleanLng = Number(Number(lng).toFixed(6));

    setFlyTarget({ latitude: cleanLat, longitude: cleanLng });
    setShowDropdown(false);

    if (addressText) {
      setAddressInput(addressText);
    }

    onLocationChange({
      latitude: cleanLat,
      longitude: cleanLng,
      address: addressText || addressInput,
      accuracy: 5,
    });

    const displayMsg = labelName || addressText || `${cleanLat.toFixed(4)}, ${cleanLng.toFixed(4)}`;
    setPinnedFeedback(`📍 Pinned map to: ${displayMsg}`);
    setTimeout(() => setPinnedFeedback(null), 4000);
  };

  // Live search & geocoding handler as user writes
  const handleInputChange = (e) => {
    const query = e.target.value;
    setAddressInput(query);

    // Keep parent updated with raw address string
    onLocationChange({
      latitude: location?.latitude || 16.7050,
      longitude: location?.longitude || 74.2433,
      accuracy: location?.accuracy || 10,
      address: query,
    });

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const cleanQuery = query.trim().toLowerCase();

    // 1. Instant local landmark matching (zero latency)
    const localMatches = KOLHAPUR_LANDMARKS.filter(
      (item) =>
        item.name.toLowerCase().includes(cleanQuery) ||
        item.address.toLowerCase().includes(cleanQuery)
    ).map((item) => ({
      name: item.name,
      address: item.address,
      latitude: item.lat,
      longitude: item.lng,
      icon: item.icon,
      badge: item.type,
      source: 'local',
    }));

    setSuggestions(localMatches);
    setShowDropdown(localMatches.length > 0);

    // If exact match found locally, point to it immediately
    const exactLocalMatch = localMatches.find(
      (m) => m.name.toLowerCase() === cleanQuery || m.address.toLowerCase() === cleanQuery
    );
    if (exactLocalMatch) {
      pointMapToCoordinates(exactLocalMatch.latitude, exactLocalMatch.longitude, exactLocalMatch.address, exactLocalMatch.name);
      return;
    }

    // 2. Online OpenStreetMap Geocoding (debounced)
    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchQuery = cleanQuery.includes('kolhapur') ? cleanQuery : `${cleanQuery}, Kolhapur`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (res.ok) {
          const data = await res.json();
          const onlineResults = data.map((item) => ({
            name: item.name || item.display_name.split(',')[0],
            address: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            icon: '📍',
            badge: 'Online Map',
            source: 'osm',
          }));

          // Merge local and online results (avoiding duplicates)
          const merged = [...localMatches];
          onlineResults.forEach((onl) => {
            if (!merged.some((m) => Math.abs(m.latitude - onl.latitude) < 0.001 && Math.abs(m.longitude - onl.longitude) < 0.001)) {
              merged.push(onl);
            }
          });

          setSuggestions(merged);
          setShowDropdown(merged.length > 0);
        }
      } catch (err) {
        // Fallback to local landmark matches
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  // Explicit locate button click or Enter key press
  const handleLocateSubmit = async (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (!addressInput || !addressInput.trim()) return;

    const query = addressInput.trim().toLowerCase();
    setIsSearching(true);

    // 1. Check local Kolhapur landmarks first (instant)
    const localMatch = KOLHAPUR_LANDMARKS.find(
      (item) => item.name.toLowerCase().includes(query) || item.address.toLowerCase().includes(query)
    );
    if (localMatch) {
      pointMapToCoordinates(localMatch.lat, localMatch.lng, localMatch.address, localMatch.name);
      setIsSearching(false);
      return;
    }

    // 2. Check if we already have top suggestion
    if (suggestions.length > 0) {
      const top = suggestions[0];
      pointMapToCoordinates(top.latitude, top.longitude, top.address, top.name);
      setIsSearching(false);
      return;
    }

    // 3. Otherwise geocode online immediately
    try {
      const searchQuery = query.includes('kolhapur') ? query : `${query}, Kolhapur`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const item = data[0];
          pointMapToCoordinates(parseFloat(item.lat), parseFloat(item.lon), item.display_name, item.name);
        } else {
          setPinnedFeedback('⚠️ Location not found. You can tap the map directly.');
        }
      }
    } catch (err) {
      setPinnedFeedback('⚠️ Geocoding unavailable. Tap the map to set pin.');
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse geocode when pin is clicked or dragged on the map
  const handleMapInteraction = async (lat, lng) => {
    const cleanLat = Number(lat.toFixed(6));
    const cleanLng = Number(lng.toFixed(6));

    setFlyTarget({ latitude: cleanLat, longitude: cleanLng });

    // Instantly notify parent of coordinates
    onLocationChange({
      latitude: cleanLat,
      longitude: cleanLng,
      address: addressInput || `Pinned at ${cleanLat.toFixed(4)}, ${cleanLng.toFixed(4)}`,
      accuracy: 5,
    });

    // Reverse geocode to resolve street name & address
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${cleanLat}&lon=${cleanLng}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setAddressInput(data.display_name);
          onLocationChange({
            latitude: cleanLat,
            longitude: cleanLng,
            address: data.display_name,
            accuracy: 5,
          });
          setPinnedFeedback(`📍 Pinned to: ${data.name || data.display_name.split(',')[0]}`);
          setTimeout(() => setPinnedFeedback(null), 4000);
        }
      }
    } catch (err) {
      // Keep existing address
    }
  };

  // Self-contained GPS location acquisition with automatic accuracy fallback
  const handleGpsAcquisition = () => {
    if (!navigator.geolocation) {
      setGpsStatusState('unavailable');
      setPinnedFeedback('⚠️ Geolocation is not supported by your device.');
      return;
    }

    setGpsLoading(true);
    setGpsStatusState('loading');
    setPinnedFeedback('📡 Acquiring live GPS signal...');

    const onPosSuccess = async (pos) => {
      const lat = Number(Number(pos.coords.latitude).toFixed(6));
      const lng = Number(Number(pos.coords.longitude).toFixed(6));
      const acc = Math.round(pos.coords.accuracy || 10);

      setGpsLoading(false);
      setGpsStatusState('granted');
      setFlyTarget({ latitude: lat, longitude: lng });

      let addr = 'Detected GPS Location, Kolhapur';
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          headers: { 'Accept-Language': 'en' },
        });
        if (res.ok) {
          const d = await res.json();
          if (d.display_name) addr = d.display_name;
        }
      } catch (e) {}

      setAddressInput(addr);

      // Instantly update parent form coordinates
      onLocationChange({
        latitude: lat,
        longitude: lng,
        address: addr,
        accuracy: acc,
      });

      if (typeof onGpsRequest === 'function') {
        try { onGpsRequest(); } catch (e) {}
      }

      setPinnedFeedback(`✓ GPS Position Acquired (±${acc}m accuracy)`);
      setTimeout(() => setPinnedFeedback(null), 4000);
    };

    const onPosError = () => {
      // Automatic fallback with enableHighAccuracy: false for laptops & desktops without hardware GNSS
      navigator.geolocation.getCurrentPosition(
        onPosSuccess,
        (fallbackErr) => {
          setGpsLoading(false);
          if (fallbackErr.code === 1) { // PERMISSION_DENIED
            setGpsStatusState('denied');
            setPinnedFeedback('⚠️ GPS permission blocked. Please allow location access in your browser.');
          } else {
            setGpsStatusState('unavailable');
            setPinnedFeedback('ℹ️ Hardware GNSS unavailable. Location synced to Kolhapur Central.');
            pointMapToCoordinates(16.7050, 74.2433, 'Kolhapur Central, Maharashtra', 'Kolhapur City');
          }
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      onPosSuccess,
      onPosError,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );
  };

  const handleClear = () => {
    setAddressInput('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div>
      {/* Geolocation Button */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleGpsAcquisition();
          }}
          className="btn-primary"
          style={{ flexGrow: 1, minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span>🎯</span>
          <span>{gpsLoading || gpsStatusState === 'loading' ? 'Acquiring GPS Signal...' : buttonText}</span>
        </button>
      </div>

      {/* Accuracy & Coords Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CURRENT PIN LOCATION</span>
          <strong style={{ color: 'var(--accent-aqua)', fontFamily: 'monospace' }}>
            {location?.latitude ? `${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}` : '16.7050, 74.2433'}
          </strong>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>PRECISION STATUS</span>
          <span style={{ color: location?.accuracy ? 'var(--accent-aqua)' : 'var(--text-muted)' }}>
            {location?.accuracy ? `±${Math.round(location.accuracy)}m Precise` : 'Kolhapur Grid'}
          </span>
        </div>
      </div>

      {/* Address Search / Auto-pointing Input */}
      <div className="loc-search-wrap" ref={dropdownRef}>
        <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          {addressLabel}
        </label>
        
        <div className="loc-search-input-row">
          <div className="loc-search-input-wrap">
            <span className="loc-search-icon-left">🔍</span>
            <input
              type="text"
              value={addressInput}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLocateSubmit(e);
                }
              }}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
              placeholder="Write location (e.g. Rankala, Shahupuri, Rajarampuri, CBS)..."
              className="loc-search-input"
            />
            {addressInput && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear();
                }}
                className="loc-search-clear-btn"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLocateSubmit(e);
            }}
            className="btn-primary loc-search-btn"
            disabled={isSearching}
            title="Point map to this written location"
          >
            <span>{isSearching ? '⏳' : '📍'}</span>
            <span>{isSearching ? 'Locating...' : 'Point on Map'}</span>
          </button>
        </div>

        {/* Live Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="loc-suggestions-dropdown">
            {suggestions.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="loc-suggestion-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  pointMapToCoordinates(item.latitude, item.longitude, item.address, item.name);
                }}
              >
                <span className="loc-suggestion-icon">{item.icon || '📍'}</span>
                <div className="loc-suggestion-content">
                  <div className="loc-suggestion-name">
                    <span>{item.name}</span>
                    <span className="loc-suggestion-badge">{item.badge}</span>
                  </div>
                  <div className="loc-suggestion-desc">{item.address}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visual Feedback Badge when pinned */}
        {pinnedFeedback && (
          <div className="loc-status-chip">
            <span>{pinnedFeedback}</span>
          </div>
        )}
      </div>

      {/* Interactive Leaflet Map with Auto Fly-To */}
      <div className="map-picker-container" style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(0, 240, 255, 0.25)', height: mapHeight }}>
        <MapContainer
          center={[flyTarget.latitude, flyTarget.longitude]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles-dark"
            maxZoom={19}
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
                  handleMapInteraction(pos.lat, pos.lng);
                },
              }}
            />
          )}

          <MapClickHandler onLocationSelect={handleMapInteraction} />
          <MapFlyController targetCoords={flyTarget} />
        </MapContainer>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>💡</span>
        <span>{hint}</span>
      </p>
    </div>
  );
}

export default LocationPicker;

