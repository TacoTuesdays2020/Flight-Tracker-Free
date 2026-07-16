import { useEffect, useRef, useState } from 'react';
import { fetchStatesByIcao24, OpenSkyRateLimitError } from '../api/openSky';
import type { FlightState } from '../api/types';
import { useSettings } from '../context/SettingsContext';

const MAX_TRACK_POINTS = 200;

interface UseAircraftTelemetryResult {
  state: FlightState | null;
  track: { latitude: number; longitude: number }[];
  loading: boolean;
  error: string | null;
}

/** Polls live telemetry for a single aircraft and accumulates a breadcrumb track. */
export function useAircraftTelemetry(icao24: string | null): UseAircraftTelemetryResult {
  const { refreshIntervalSeconds, credentials } = useSettings();
  const [state, setState] = useState<FlightState | null>(null);
  const [track, setTrack] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const trackRef = useRef<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    if (!icao24) return;
    let cancelled = false;
    trackRef.current = [];
    setTrack([]);

    const load = async () => {
      try {
        const { states } = await fetchStatesByIcao24([icao24], credentials);
        if (cancelled) return;
        const next = states[0] ?? null;
        setState(next);
        setError(null);
        if (next?.latitude != null && next?.longitude != null) {
          const point = { latitude: next.latitude, longitude: next.longitude };
          const last = trackRef.current[trackRef.current.length - 1];
          if (!last || last.latitude !== point.latitude || last.longitude !== point.longitude) {
            trackRef.current = [...trackRef.current, point].slice(-MAX_TRACK_POINTS);
            setTrack(trackRef.current);
          }
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof OpenSkyRateLimitError) {
          setError('Rate limited by OpenSky — showing last known telemetry.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load telemetry.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, refreshIntervalSeconds * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [icao24, refreshIntervalSeconds, credentials]);

  return { state, track, loading, error };
}
