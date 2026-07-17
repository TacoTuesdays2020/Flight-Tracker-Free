import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Continental US, used when location permission is denied or unavailable
// (e.g. simulators, web) so the map still opens over live air traffic.
export const DEFAULT_REGION: Region = {
  latitude: 39.5,
  longitude: -98.35,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

export function useUserLocation() {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setPermissionDenied(true);
          return;
        }
        const position = await Location.getCurrentPositionAsync({});
        if (cancelled) return;
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 4,
          longitudeDelta: 4,
        });
      } catch {
        if (!cancelled) setPermissionDenied(true);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { region, permissionDenied, ready };
}
