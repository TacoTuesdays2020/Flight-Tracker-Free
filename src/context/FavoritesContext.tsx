import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'flight-tracker/favorites';

export interface FavoriteEntry {
  icao24: string;
  callsign: string | null;
  savedAt: number;
}

interface FavoritesContextValue {
  favorites: FavoriteEntry[];
  isFavorite: (icao24: string) => boolean;
  toggleFavorite: (entry: { icao24: string; callsign: string | null }) => void;
  loaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (stored) setFavorites(JSON.parse(stored));
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = (next: FavoriteEntry[]) => {
    setFavorites(next);
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => {});
  };

  const isFavorite = (icao24: string) => favorites.some((f) => f.icao24 === icao24);

  const toggleFavorite = (entry: { icao24: string; callsign: string | null }) => {
    if (isFavorite(entry.icao24)) {
      persist(favorites.filter((f) => f.icao24 !== entry.icao24));
    } else {
      persist([{ ...entry, savedAt: Date.now() }, ...favorites]);
    }
  };

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, loaded }),
    [favorites, loaded]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
