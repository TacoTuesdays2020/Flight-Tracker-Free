import React, { memo, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { FlightState } from '../api/types';
import { AIRCRAFT_CLASS_COLORS } from '../theme/colors';

interface AircraftMarkerProps {
  flight: FlightState;
  onPress: () => void;
}

function AircraftMarkerImpl({ flight, onPress }: AircraftMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setTracksViewChanges(false), 300);
    return () => clearTimeout(timeout);
  }, []);

  if (flight.latitude == null || flight.longitude == null) return null;
  const color = AIRCRAFT_CLASS_COLORS[flight.aircraftClass];
  const iconName = flight.aircraftClass === 'helicopter' ? 'airplane' : 'airplane-sharp';

  return (
    <Marker
      coordinate={{ latitude: flight.latitude, longitude: flight.longitude }}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.5 }}
      title={flight.callsign?.trim() || flight.icao24.toUpperCase()}
      description={flight.originCountry}
    >
      <View
        style={{
          transform: [{ rotate: `${(flight.trueTrack ?? 0) - 45}deg` }],
        }}
      >
        <Ionicons name={iconName} size={22} color={color} />
      </View>
    </Marker>
  );
}

function areEqual(prev: AircraftMarkerProps, next: AircraftMarkerProps) {
  return (
    prev.flight.icao24 === next.flight.icao24 &&
    prev.flight.latitude === next.flight.latitude &&
    prev.flight.longitude === next.flight.longitude &&
    prev.flight.trueTrack === next.flight.trueTrack
  );
}

export const AircraftMarker = memo(AircraftMarkerImpl, areEqual);
