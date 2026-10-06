import { useState, useEffect } from 'react';
import { fetchOSRMRoute } from '../services/osrm';

export function useOSRMRoute(originLat, originLng, destLat, destLng) {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (originLat == null || originLng == null || destLat == null || destLng == null) {
      setRouteData(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchOSRMRoute(originLat, originLng, destLat, destLng)
      .then((data) => {
        if (isMounted) {
          setRouteData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [originLat, originLng, destLat, destLng]);

  return { routeData, loading, error };
}

export default useOSRMRoute;

