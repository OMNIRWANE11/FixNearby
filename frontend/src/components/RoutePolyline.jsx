import React from 'react';
import { Polyline } from 'react-leaflet';

export function RoutePolyline({ coordinates = [], color = '#00F0FF', weight = 5 }) {
  if (!coordinates || coordinates.length < 2) return null;

  return (
    <Polyline
      positions={coordinates}
      color={color}
      weight={weight}
      opacity={0.9}
      dashArray="6, 6"
      lineCap="round"
    />
  );
}

export default RoutePolyline;

