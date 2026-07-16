import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FlightState } from '../api/types';
import { AIRCRAFT_CLASS_LABELS } from '../classify/aircraftType';
import { getFlightIconType } from '../classify/aircraftIcon';
import { AIRCRAFT_CLASS_COLORS } from '../theme/colors';
import { useTheme } from '../theme/useTheme';
import { useSettings } from '../context/SettingsContext';
import { formatAltitude, formatSpeed } from '../utils/format';
import { AircraftGlyph } from './icons/AircraftGlyph';

interface FlightListItemProps {
  flight: FlightState;
  onPress: () => void;
  distanceLabel?: string;
}

export function FlightListItem({ flight, onPress, distanceLabel }: FlightListItemProps) {
  const theme = useTheme();
  const { units } = useSettings();
  const color = AIRCRAFT_CLASS_COLORS[flight.aircraftClass];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '1F', borderColor: theme.border }]}>
        <AircraftGlyph
          type={getFlightIconType(flight)}
          color={color}
          size={20}
          rotationDeg={flight.trueTrack ?? 0}
        />
      </View>
      <View style={styles.info}>
        <Text style={[styles.callsign, { color: theme.text }]}>
          {flight.callsign?.trim() || flight.icao24.toUpperCase()}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1}>
          {flight.originCountry} · {AIRCRAFT_CLASS_LABELS[flight.aircraftClass]}
        </Text>
      </View>
      <View style={styles.metrics}>
        <Text style={[styles.metric, { color: theme.text }]}>
          {flight.onGround ? 'On ground' : formatAltitude(flight.baroAltitude, units)}
        </Text>
        <Text style={[styles.metricSub, { color: theme.textMuted }]}>
          {distanceLabel ?? formatSpeed(flight.velocity, units)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  callsign: { fontSize: 15, fontWeight: '700' },
  subtitle: { fontSize: 12 },
  metrics: { alignItems: 'flex-end', gap: 2 },
  metric: { fontSize: 13, fontWeight: '600' },
  metricSub: { fontSize: 11 },
});
