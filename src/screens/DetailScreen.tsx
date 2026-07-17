import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { LeafletMapView, type MapMarkerInput } from '../components/map/LeafletMapView';
import { InfoRow, InfoSection } from '../components/InfoSection';
import { LoadingView } from '../components/LoadingView';
import { useAircraftTelemetry } from '../hooks/useAircraftTelemetry';
import { useAircraftDetails } from '../hooks/useAircraftDetails';
import { useFavorites } from '../context/FavoritesContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../theme/useTheme';
import { AIRCRAFT_CLASS_LABELS } from '../classify/aircraftType';
import { getAircraftIconType } from '../classify/aircraftIcon';
import { AIRCRAFT_CLASS_COLORS, AIRCRAFT_ICON_COLOR } from '../theme/colors';
import { EMITTER_CATEGORY_LABELS } from '../api/types';
import { AircraftGlyph } from '../components/icons/AircraftGlyph';
import {
  formatAltitude,
  formatCoordinate,
  formatHeading,
  formatLastContact,
  formatSpeed,
  formatVerticalRate,
} from '../utils/format';

type Props = RootStackScreenProps<'Detail'>;

export function DetailScreen({ route, navigation }: Props) {
  const { icao24, callsign: initialCallsign } = route.params;
  const theme = useTheme();
  const { units } = useSettings();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { state, track, loading: telemetryLoading, error } = useAircraftTelemetry(icao24);
  const callsign = state?.callsign ?? initialCallsign;
  const { aircraftInfo, routeInfo } = useAircraftDetails(icao24, callsign);

  const favorite = isFavorite(icao24);
  const classColor = state ? AIRCRAFT_CLASS_COLORS[state.aircraftClass] : AIRCRAFT_ICON_COLOR;

  const displayName = callsign?.trim() || icao24.toUpperCase();

  const position = useMemo(() => {
    if (state?.latitude == null || state?.longitude == null) return null;
    return { latitude: state.latitude, longitude: state.longitude };
  }, [state?.latitude, state?.longitude]);

  const mapRegion = useMemo(() => {
    if (!position) return null;
    return { ...position, latitudeDelta: 1.2, longitudeDelta: 1.2 };
  }, [position]);

  const mapMarkers: MapMarkerInput[] = useMemo(() => {
    if (!position) return [];
    return [
      {
        id: icao24,
        latitude: position.latitude,
        longitude: position.longitude,
        iconType: state ? getAircraftIconType(state) : 'propeller',
        color: classColor,
        rotationDeg: state?.trueTrack ?? 0,
      },
    ];
  }, [position, state, icao24, classColor]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: displayName,
      headerRight: () => (
        <Pressable
          onPress={() => toggleFavorite({ icao24, callsign: callsign ?? null })}
          hitSlop={12}
        >
          <Ionicons
            name={favorite ? 'star' : 'star-outline'}
            size={22}
            color={favorite ? theme.primary : theme.textMuted}
          />
        </Pressable>
      ),
    });
  }, [navigation, displayName, favorite, icao24, callsign, theme.textMuted, toggleFavorite]);

  if (telemetryLoading && !state) {
    return <LoadingView label="Fetching live telemetry…" />;
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
    >
      {position && mapRegion && (
        <View style={[styles.mapWrap, { borderColor: theme.border }]}>
          <LeafletMapView
            interactive={false}
            followRegion
            initialRegion={mapRegion}
            region={mapRegion}
            markers={mapMarkers}
            track={track}
            trackColor={classColor}
          />
        </View>
      )}

      {error && (
        <Text style={[styles.warning, { color: theme.danger }]}>{error}</Text>
      )}
      {!state && !telemetryLoading && (
        <Text style={[styles.warning, { color: theme.textMuted }]}>
          This aircraft is not currently broadcasting a position — showing last known details.
        </Text>
      )}

      <View style={[styles.badge, { backgroundColor: classColor + '1F', borderColor: theme.border }]}>
        <AircraftGlyph
          type={state ? getAircraftIconType(state) : 'propeller'}
          color={classColor}
          size={13}
        />
        <Text style={[styles.badgeText, { color: classColor }]}>
          {state ? AIRCRAFT_CLASS_LABELS[state.aircraftClass] : 'Unknown class'}
        </Text>
      </View>

      <InfoSection title="Identification">
        <InfoRow label="Callsign" value={callsign?.trim() || '—'} />
        <InfoRow label="ICAO24 address" value={icao24.toUpperCase()} />
        <InfoRow label="Registration" value={aircraftInfo?.registration ?? 'Unknown'} />
        <InfoRow label="Origin country" value={state?.originCountry ?? '—'} />
      </InfoSection>

      <InfoSection title="Aircraft">
        <InfoRow
          label="Manufacturer"
          value={aircraftInfo?.manufacturer ?? 'Unknown'}
        />
        <InfoRow label="Model" value={aircraftInfo?.model ?? 'Unknown'} />
        <InfoRow label="Type code" value={aircraftInfo?.typeCode ?? 'Unknown'} />
        <InfoRow label="Owner / operator" value={aircraftInfo?.owner ?? aircraftInfo?.operator ?? 'Unknown'} />
        <InfoRow
          label="ADS-B category"
          value={state?.category ? EMITTER_CATEGORY_LABELS[state.category] : 'Unknown'}
        />
      </InfoSection>

      {(routeInfo?.originAirport || routeInfo?.destinationAirport) && (
        <InfoSection title="Route">
          <InfoRow label="Flight number" value={routeInfo?.flightNumber ?? '—'} />
          <InfoRow label="Origin" value={routeInfo?.originAirport ?? 'Unknown'} />
          <InfoRow label="Destination" value={routeInfo?.destinationAirport ?? 'Unknown'} />
        </InfoSection>
      )}

      <InfoSection title="Position & Telemetry">
        <InfoRow label="Status" value={state?.onGround ? 'On ground' : 'Airborne'} />
        <InfoRow label="Altitude (barometric)" value={formatAltitude(state?.baroAltitude ?? null, units)} />
        <InfoRow label="Altitude (GPS)" value={formatAltitude(state?.geoAltitude ?? null, units)} />
        <InfoRow label="Ground speed" value={formatSpeed(state?.velocity ?? null, units)} />
        <InfoRow label="Heading" value={formatHeading(state?.trueTrack ?? null)} />
        <InfoRow label="Vertical rate" value={formatVerticalRate(state?.verticalRate ?? null, units)} />
        <InfoRow label="Latitude" value={formatCoordinate(state?.latitude ?? null, 'lat')} />
        <InfoRow label="Longitude" value={formatCoordinate(state?.longitude ?? null, 'lon')} />
        <InfoRow label="Squawk" value={state?.squawk ?? '—'} />
        <InfoRow label="Position source" value={state?.positionSource ?? '—'} />
        <InfoRow
          label="Last contact"
          value={state?.lastContact ? formatLastContact(state.lastContact) : '—'}
        />
      </InfoSection>

      <Text style={[styles.attribution, { color: theme.textMuted }]}>
        Live position data: OpenSky Network. Aircraft & route lookups: hexdb.io. Classification
        is inferred from callsign and ADS-B category and may be inaccurate.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 12, paddingBottom: 32 },
  mapWrap: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  warning: { fontSize: 12, paddingHorizontal: 4 },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  attribution: { fontSize: 11, textAlign: 'center', paddingHorizontal: 12, marginTop: 4 },
});
