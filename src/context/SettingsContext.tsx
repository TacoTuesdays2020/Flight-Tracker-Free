import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { Units } from '../utils/format';
import type { OpenSkyCredentials } from '../api/openSky';

const UNITS_KEY = 'flight-tracker/units';
const REFRESH_KEY = 'flight-tracker/refresh-interval';
const CLIENT_ID_KEY = 'flight-tracker-opensky-client-id';
const CLIENT_SECRET_KEY = 'flight-tracker-opensky-client-secret';

export const REFRESH_INTERVAL_OPTIONS = [10, 15, 30, 60] as const;
export type RefreshInterval = (typeof REFRESH_INTERVAL_OPTIONS)[number];

interface SettingsContextValue {
  units: Units;
  setUnits: (units: Units) => void;
  refreshIntervalSeconds: RefreshInterval;
  setRefreshIntervalSeconds: (seconds: RefreshInterval) => void;
  credentials: OpenSkyCredentials | null;
  setCredentials: (credentials: OpenSkyCredentials | null) => void;
  loaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnitsState] = useState<Units>('imperial');
  const [refreshIntervalSeconds, setRefreshState] = useState<RefreshInterval>(15);
  const [credentials, setCredentialsState] = useState<OpenSkyCredentials | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedUnits, storedRefresh, clientId, clientSecret] = await Promise.all([
          AsyncStorage.getItem(UNITS_KEY),
          AsyncStorage.getItem(REFRESH_KEY),
          SecureStore.getItemAsync(CLIENT_ID_KEY).catch(() => null),
          SecureStore.getItemAsync(CLIENT_SECRET_KEY).catch(() => null),
        ]);
        if (storedUnits === 'imperial' || storedUnits === 'metric') setUnitsState(storedUnits);
        const parsedRefresh = Number(storedRefresh);
        if (REFRESH_INTERVAL_OPTIONS.includes(parsedRefresh as RefreshInterval)) {
          setRefreshState(parsedRefresh as RefreshInterval);
        }
        if (clientId && clientSecret) {
          setCredentialsState({ clientId, clientSecret });
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setUnits = (next: Units) => {
    setUnitsState(next);
    AsyncStorage.setItem(UNITS_KEY, next).catch(() => {});
  };

  const setRefreshIntervalSeconds = (next: RefreshInterval) => {
    setRefreshState(next);
    AsyncStorage.setItem(REFRESH_KEY, String(next)).catch(() => {});
  };

  const setCredentials = (next: OpenSkyCredentials | null) => {
    setCredentialsState(next);
    if (next) {
      SecureStore.setItemAsync(CLIENT_ID_KEY, next.clientId).catch(() => {});
      SecureStore.setItemAsync(CLIENT_SECRET_KEY, next.clientSecret).catch(() => {});
    } else {
      SecureStore.deleteItemAsync(CLIENT_ID_KEY).catch(() => {});
      SecureStore.deleteItemAsync(CLIENT_SECRET_KEY).catch(() => {});
    }
  };

  const value = useMemo(
    () => ({
      units,
      setUnits,
      refreshIntervalSeconds,
      setRefreshIntervalSeconds,
      credentials,
      setCredentials,
      loaded,
    }),
    [units, refreshIntervalSeconds, credentials, loaded]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
