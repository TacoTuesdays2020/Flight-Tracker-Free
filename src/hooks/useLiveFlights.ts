import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { fetchStatesInBoundingBox, OpenSkyRateLimitError } from '../api/openSky';
import type { BoundingBox, FlightState } from '../api/types';
import { useSettings } from '../context/SettingsContext';

interface UseLiveFlightsResult {
  flights: FlightState[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
}

/**
 * Polls OpenSky for live state vectors inside a bounding box on the
 * configured refresh interval. Polling pauses while the app is backgrounded
 * and while the box is unset, both to save battery and to stay under the
 * free-tier rate limit.
 */
export function useLiveFlights(box: BoundingBox | null): UseLiveFlightsResult {
  const { refreshIntervalSeconds, credentials } = useSettings();
  const [flights, setFlights] = useState<FlightState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const inFlight = useRef(false);
  const boxRef = useRef(box);
  boxRef.current = box;

  const load = useCallback(async () => {
    const currentBox = boxRef.current;
    if (!currentBox || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const { states, time } = await fetchStatesInBoundingBox(currentBox, credentials);
      setFlights(states);
      setLastUpdated(time * 1000);
      setError(null);
    } catch (err) {
      if (err instanceof OpenSkyRateLimitError) {
        setError('Rate limited by OpenSky — showing last known positions.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load live flights.');
      }
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [credentials]);

  useEffect(() => {
    if (!box) return;
    load();

    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (interval) return;
      interval = setInterval(load, refreshIntervalSeconds * 1000);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };

    start();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        load();
        start();
      } else {
        stop();
      }
    });

    return () => {
      stop();
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box?.minLat, box?.maxLat, box?.minLon, box?.maxLon, refreshIntervalSeconds, load]);

  return { flights, loading, error, lastUpdated, refresh: load };
}
