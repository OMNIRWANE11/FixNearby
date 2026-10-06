import axios from 'axios';
import { calculateHaversineDistanceKm } from '../utils/haversine';

const OSRM_URL = import.meta.env.VITE_OSRM_URL || 'https://router.project-osrm.org/route/v1/driving';

export async function fetchOSRMRoute(originLat, originLng, destLat, destLng) {
  try {
    // OSRM requires coords in {lng},{lat};{lng},{lat} order
    const url = `${OSRM_URL}/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const res = await axios.get(url, { timeout: 4000 });
    
    if (res.data && res.data.routes && res.data.routes.length > 0) {
      const route = res.data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMinutes = Math.max(2, Math.round(route.duration / 60));
      
      // Convert [lng, lat] to [lat, lng] for Leaflet
      const coordinates = route.geometry.coordinates.map((pt) => [pt[1], pt[0]]);
      
      return {
        success: true,
        isOsrm: true,
        distanceKm,
        durationMinutes,
        coordinates,
        fallbackNotice: null,
      };
    }
  } catch (err) {
    // Silent fallback to straight line
  }

  // Fallback to Haversine straight line
  const straightDist = calculateHaversineDistanceKm(originLat, originLng, destLat, destLng) || 2.0;
  const estimatedDist = Math.round(straightDist * 1.25 * 10) / 10;
  const estimatedEta = Math.max(3, Math.round((estimatedDist / 30) * 60 + 3));

  // Generate 8 interpolated steps
  const steps = 8;
  const coordinates = [];
  for (let i = 0; i <= steps; i++) {
    const r = i / steps;
    const lat = originLat + (destLat - originLat) * r;
    const lng = originLng + (destLng - originLng) * r;
    coordinates.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
  }

  return {
    success: true,
    isOsrm: false,
    distanceKm: estimatedDist,
    durationMinutes: estimatedEta,
    coordinates,
    fallbackNotice: 'Live route unavailable — ETA estimated from distance.',
  };
}

