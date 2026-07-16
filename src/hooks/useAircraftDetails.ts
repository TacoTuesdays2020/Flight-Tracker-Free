import { useEffect, useState } from 'react';
import { getAircraftInfo, getRouteInfo } from '../api/aircraftInfo';
import type { AircraftInfo, RouteInfo } from '../api/types';

interface UseAircraftDetailsResult {
  aircraftInfo: AircraftInfo | null;
  routeInfo: RouteInfo | null;
  loading: boolean;
}

/** Resolves registration/type metadata and a best-effort route for a flight. */
export function useAircraftDetails(
  icao24: string | null,
  callsign: string | null
): UseAircraftDetailsResult {
  const [aircraftInfo, setAircraftInfo] = useState<AircraftInfo | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAircraftInfo(null);
    setRouteInfo(null);

    (async () => {
      const [aircraft, route] = await Promise.all([
        icao24 ? getAircraftInfo(icao24) : Promise.resolve(null),
        callsign ? getRouteInfo(callsign) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      setAircraftInfo(aircraft);
      setRouteInfo(route);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [icao24, callsign]);

  return { aircraftInfo, routeInfo, loading };
}
