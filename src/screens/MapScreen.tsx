import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { TabScreenProps } from '../navigation/types';
import { AircraftMarker } from '../components/AircraftMarker';
import { FilterChips } from '../components/FilterChips';
import { ErrorBanner } from '../components/ErrorBanner';
import { useLiveFlights } from '../hooks/useLiveFlights';
import { useUserLocation, DEFAULT_REGION, type Region } from '../hooks/useUserLocation';
import type { AircraftClass, BoundingBox } from '../api/types';
import { AIRCRAFT_CLASS_ORDER } from '../classify/aircraftType';
import { useTheme } from '../theme/useTheme';
import { GlossySurface } from '../components/GlossySurface';
import { formatLastContact } from '../utils/format';

const MAX_DELTA = 12; // clamp query box so panning out doesn't request the whole globe at once

function regionToBoundingBox(region: Region): BoundingBox {
  const latitudeDelta = Math.min(region.latitudeDelta, MAX_DELTA);
  const longitudeDelta = Math.min(region.longitudeDelta, MAX_DELTA);
  return {
    minLat: Math.max(-90, region.latitude - latitudeDelta / 2),
    maxLat: Math.min(90, region.latitude + latitudeDelta / 2),
    minLon: Math.max(-180, region.longitude - longitudeDelta / 2),
    maxLon: Math.min(180, region.longitude + longitudeDelta / 2),
  };
}

type Props = TabScreenProps<'Map'>;

export function MapScreen({ navigation }: Props) {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const { region: initialRegion } = useUserLocation();
  const [boundingBox, setBoundingBox] = useState<BoundingBox>(regionToBoundingBox(initialRegion));
  const [selectedClasses, setSelectedClasses] = useState<Set<AircraftClass>>(
    new Set(AIRCRAFT_CLASS_ORDER)
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { flights, loading, error, lastUpdated } = useLiveFlights(boundingBox);

  const visibleFlights = useMemo(
    () => flights.filter((f) => selectedClasses.has(f.aircraftClass)),
    [flights, selectedClasses]
  );

  const counts = useMemo(() => {
    const acc: Partial<Record<AircraftClass, number>> = {};
    for (const f of flights) acc[f.aircraftClass] = (acc[f.aircraftClass] ?? 0) + 1;
    return acc;
  }, [flights]);

  const toggleClass = useCallback((cls: AircraftClass) => {
    setSelectedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) next.delete(cls);
      else next.add(cls);
      return next;
    });
  }, []);

  const onRegionChangeComplete = useCallback((region: Region) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBoundingBox(regionToBoundingBox(region));
    }, 500);
  }, []);

  const recenter = useCallback(() => {
    mapRef.current?.animateToRegion(initialRegion, 500);
  }, [initialRegion]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        userInterfaceStyle="dark"
        initialRegion={initialRegion ?? DEFAULT_REGION}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={theme.mapStyle as any}
      >
        {visibleFlights.map((flight) => (
          <AircraftMarker
            key={flight.icao24}
            flight={flight}
            onPress={() => navigation.navigate('Detail', { icao24: flight.icao24, callsign: flight.callsign })}
          />
        ))}
      </MapView>

      <View style={styles.topOverlay} pointerEvents="box-none">
        <FilterChips selected={selectedClasses} onToggle={toggleClass} counts={counts} />
        {error && <ErrorBanner message={error} />}
      </View>

      <View style={[styles.statusBar, { backgroundColor: theme.surface + 'EE' }]} pointerEvents="none">
        <Text style={[styles.statusText, { color: theme.textMuted }]}>
          {loading ? 'Updating…' : lastUpdated ? `Updated ${formatLastContact(lastUpdated / 1000)}` : 'No data yet'}
          {'  ·  '}
          {visibleFlights.length} aircraft in view
        </Text>
      </View>

      <Pressable onPress={recenter} style={styles.recenterButtonWrap}>
        <GlossySurface style={styles.recenterButton}>
          <Ionicons name="locate" size={21} color={theme.text} />
        </GlossySurface>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  statusBar: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusText: {
    fontSize: 11,
    textAlign: 'center',
  },
  recenterButtonWrap: {
    position: 'absolute',
    right: 12,
    bottom: 56,
    elevation: 3,
  },
  recenterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
