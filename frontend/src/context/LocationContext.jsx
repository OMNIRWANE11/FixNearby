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

  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      setErrorMessage('Browser Geolocation API is not supported by your device.');
      return;
    }

    setGpsStatus('loading');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          accuracy: Math.round(accuracy),
          address: 'Detected GPS Location',
        });
        setGpsStatus('granted');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
          setErrorMessage('GPS permission was denied. You can tap the map to choose your location manually.');
        } else {
          setGpsStatus('unavailable');
          setErrorMessage('Unable to retrieve GPS fix. Falling back to manual map picker.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const setManualLocation = (latitude, longitude, address = 'Selected Location') => {
    setLocation({
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
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

