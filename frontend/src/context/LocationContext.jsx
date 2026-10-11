import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

// Default center: Kolhapur City Center, Maharashtra
const DEFAULT_COORDS = {
  latitude: 16.7050,
  longitude: 74.2433,
  address: 'Kolhapur Central, Maharashtra',
  accuracy: 10,
};

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(DEFAULT_COORDS);
  const [gpsStatus, setGpsStatus] = useState('prompt'); // prompt, granted, denied, loading, unavailable
  const [errorMessage, setErrorMessage] = useState(null);

  const requestGpsLocation = (callback) => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      setErrorMessage('Browser Geolocation API is not supported by your device.');
      return;
    }

    setGpsStatus('loading');
    setErrorMessage(null);

    const onPos = async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const lat = Number(Number(latitude).toFixed(6));
      const lng = Number(Number(longitude).toFixed(6));
      const acc = Math.round(accuracy || 10);

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

      const locObj = {
        latitude: lat,
        longitude: lng,
        accuracy: acc,
        address: addr,
      };
      setLocation(locObj);
      setGpsStatus('granted');
      if (typeof callback === 'function') callback(locObj);
    };

    navigator.geolocation.getCurrentPosition(
      onPos,
      () => {
        // Fallback with enableHighAccuracy: false for laptops and desktops
        navigator.geolocation.getCurrentPosition(
          onPos,
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              setGpsStatus('denied');
              setErrorMessage('GPS permission was denied. You can tap the map to choose your location manually.');
            } else {
              setGpsStatus('unavailable');
              setErrorMessage('Unable to retrieve GPS fix. Falling back to Kolhapur Central.');
            }
          },
          { enableHighAccuracy: false, timeout: 8000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );
  };

  const setManualLocation = (latitude, longitude, address = 'Selected Location') => {
    if (typeof latitude === 'object' && latitude !== null) {
      const obj = latitude;
      setLocation({
        latitude: Number(Number(obj.latitude).toFixed(6)),
        longitude: Number(Number(obj.longitude).toFixed(6)),
        accuracy: obj.accuracy || 5,
        address: obj.address || 'Selected Location',
      });
      return;
    }
    setLocation({
      latitude: Number(Number(latitude).toFixed(6)),
      longitude: Number(Number(longitude).toFixed(6)),
      accuracy: 5,
      address,
    });
  };

  // Attempt initial GPS retrieval softly
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
            address: 'Detected GPS Location',
          });
          setGpsStatus('granted');
        },
        () => {
          // Keep default Kolhapur coordinates
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  const value = {
    location,
    gpsStatus,
    errorMessage,
    requestGpsLocation,
    setManualLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}

