import { useLocationContext } from '../context/LocationContext';

export function useGeolocation() {
  return useLocationContext();
}

export default useGeolocation;

