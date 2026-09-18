import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return Promise.reject(new Error('Geolocation not supported'));
    }

    setIsLocating(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCoordinates(coords);
          setIsLocating(false);
          resolve(coords);
        },
        (err) => {
          setIsLocating(false);
          let errorMsg = 'Unable to retrieve location.';
          if (err.code === err.PERMISSION_DENIED) {
            errorMsg = 'Location permission denied. Please allow location access in your browser settings.';
          }
          setError(errorMsg);
          // Fallback coords (e.g. New Delhi Central)
          const fallback = { lat: 28.6139, lng: 77.2090 };
          setCoordinates(fallback);
          resolve(fallback);
        },
        { enableHighAccuracy: false, timeout: 2500 }
      );
    });
  }, []);

  return {
    coordinates,
    setCoordinates,
    isLocating,
    error,
    detectLocation
  };
}

export default useGeolocation;
