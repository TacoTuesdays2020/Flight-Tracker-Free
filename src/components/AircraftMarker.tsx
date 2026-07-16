import React, { memo, useEffect, useState } from 'react';
import { Marker } from 'react-native-maps';
import type { FlightState } from '../api/types';
import { AIRCRAFT_CLASS_COLORS } from '../theme/colors';
import { getFlightIconType } from '../classify/aircraftIcon';
import { AircraftGlyph } from './icons/AircraftGlyph';

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

  return (
    <Marker
      coordinate={{ latitude: flight.latitude, longitude: flight.longitude }}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.5 }}
      title={flight.callsign?.trim() || flight.icao24.toUpperCase()}
      description={flight.originCountry}
    >
      <AircraftGlyph
        type={getFlightIconType(flight)}
        color={AIRCRAFT_CLASS_COLORS[flight.aircraftClass]}
        size={24}
        rotationDeg={flight.trueTrack ?? 0}
      />
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
