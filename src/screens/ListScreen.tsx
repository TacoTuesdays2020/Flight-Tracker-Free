import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TabScreenProps } from '../navigation/types';
import { FlightListItem } from '../components/FlightListItem';
import { FilterChips } from '../components/FilterChips';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingView } from '../components/LoadingView';
import { useLiveFlights } from '../hooks/useLiveFlights';
import { useUserLocation } from '../hooks/useUserLocation';
import type { AircraftClass, BoundingBox } from '../api/types';
import { AIRCRAFT_CLASS_ORDER } from '../classify/aircraftType';
import { useTheme } from '../theme/useTheme';
import { useSettings } from '../context/SettingsContext';
import { formatDistance, haversineDistanceKm } from '../utils/format';

const SEARCH_DELTA = 8;

function regionToBoundingBox(latitude: number, longitude: number): BoundingBox {
  return {
    minLat: Math.max(-90, latitude - SEARCH_DELTA / 2),
    maxLat: Math.min(90, latitude + SEARCH_DELTA / 2),
    minLon: Math.max(-180, longitude - SEARCH_DELTA / 2),
    maxLon: Math.min(180, longitude + SEARCH_DELTA / 2),
  };
}

type Props = TabScreenProps<'List'>;

export function ListScreen({ navigation }: Props) {
  const theme = useTheme();
  const { units } = useSettings();
  const { region, ready } = useUserLocation();
  const [query, setQuery] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<Set<AircraftClass>>(
    new Set(AIRCRAFT_CLASS_ORDER)
  );

  const boundingBox = useMemo(
    () => regionToBoundingBox(region.latitude, region.longitude),
    [region.latitude, region.longitude]
  );

  const { flights, loading, error } = useLiveFlights(ready ? boundingBox : null);

  const toggleClass = (cls: AircraftClass) => {
    setSelectedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) next.delete(cls);
      else next.add(cls);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return flights
      .filter((f) => selectedClasses.has(f.aircraftClass))
      .filter(
        (f) =>
          !q ||
          f.callsign?.toLowerCase().includes(q) ||
          f.icao24.toLowerCase().includes(q) ||
          f.originCountry.toLowerCase().includes(q)
      )
      .map((f) => ({
        flight: f,
        distanceKm:
          f.latitude != null && f.longitude != null
            ? haversineDistanceKm(region, { latitude: f.latitude, longitude: f.longitude })
            : Infinity,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [flights, selectedClasses, query, region]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={16} color={theme.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search callsign, ICAO24, country…"
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>
      <FilterChips selected={selectedClasses} onToggle={toggleClass} />
      {error && <ErrorBanner message={error} />}

      {!ready || (loading && flights.length === 0) ? (
        <LoadingView label="Finding nearby air traffic…" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.flight.icao24}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <FlightListItem
              flight={item.flight}
              distanceLabel={
                Number.isFinite(item.distanceKm) ? formatDistance(item.distanceKm, units) : undefined
              }
              onPress={() =>
                navigation.navigate('Detail', {
                  icao24: item.flight.icao24,
                  callsign: item.flight.callsign,
                })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.textMuted }]}>
              No aircraft match your filters right now.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  list: { padding: 12, gap: 8 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 13 },
});
