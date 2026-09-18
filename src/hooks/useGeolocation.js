import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Helper to detect location via IP fallback when HTML5 geolocation is unavailable/denied/timed out
   */
  const fetchIPLocationFallback = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/', { timeout: 4000 });
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          return {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
            city: data.city,
            region: data.region
          };
        }
      }
    } catch {
      // Ignore IP fetch error
    }
    // Hardcoded fallback if all network lookups fail
    return { lat: 28.6139, lng: 77.2090 };
  };

  const detectLocation = useCallback(() => {
    setIsLocating(true);
    setError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Browser GPS not supported. Fetching network location...');
        fetchIPLocationFallback().then(coords => {
          setCoordinates(coords);
          setIsLocating(false);
          resolve(coords);
        });
        return;
      }

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
        async (err) => {
          let errorMsg = 'Unable to retrieve precise GPS location.';
          if (err.code === err.PERMISSION_DENIED) {
            errorMsg = 'Location permission denied in browser. Using network approximate location.';
          } else if (err.code === err.TIMEOUT) {
            errorMsg = 'GPS location timed out. Using network location...';
          }
          setError(errorMsg);

          // Fallback to IP-based location
          const fallback = await fetchIPLocationFallback();
          setCoordinates(fallback);
          setIsLocating(false);
          resolve(fallback);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
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
