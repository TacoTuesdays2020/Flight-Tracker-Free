import type { AircraftClass } from '../api/types';

/**
 * Flight Tracker Free's chrome — backgrounds, buttons, chips, tab bar — is
 * pure black, white, and grey; the one deliberate exception is the aircraft
 * icons themselves, which carry a small, specific accent per class (on top
 * of already being shape-coded, see classify/aircraftIcon) so the busiest
 * traffic types pop on the map at a glance. Private/other stay in the
 * neutral ink to keep the accent list short and readable.
 */

// Default ink for aircraft classes that don't get a dedicated accent.
export const AIRCRAFT_ICON_COLOR = '#f5f5f7';

export const AIRCRAFT_CLASS_COLORS: Record<AircraftClass, string> = {
  commercial: '#FF9F0A', // orange
  private: AIRCRAFT_ICON_COLOR,
  helicopter: '#FFD60A', // yellow
  military: '#2E7D32', // forest green
  other: AIRCRAFT_ICON_COLOR,
};

const NIGHT_MAP_STYLE: unknown[] = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8e8e93' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2c2c2e' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#3a3a3c' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#141416' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1c1e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#000000' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c2c2e' }] },
  { featureType: 'road.arterial', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#48484a' }] },
];

export const theme = {
  background: '#000000',
  surface: '#121214',
  surfaceAlt: '#1c1c1e',
  border: 'rgba(255,255,255,0.12)',
  text: '#f5f5f7',
  textMuted: '#8e8e93',
  primary: '#ffffff',
  onPrimary: '#000000',
  danger: '#f5f5f7',
  success: '#ffffff',
  amber: '#ffffff',
  tabBar: '#0a0a0b',
  glossHigh: 'rgba(255,255,255,0.30)',
  glossHighOnLight: 'rgba(255,255,255,0.85)',
  glossLow: 'rgba(255,255,255,0)',
  mapStyle: NIGHT_MAP_STYLE,
};

export type Theme = typeof theme;
