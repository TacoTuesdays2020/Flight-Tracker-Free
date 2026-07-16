import type { AircraftClass } from '../api/types';

/**
 * Flight Tracker Free commits to a single, deliberately muted dark theme —
 * an ops-console aesthetic, not a neon map. Every hue below is desaturated
 * on purpose; class colors are chosen to be distinguishable at a glance
 * without any of them reading as "bright."
 */
export const AIRCRAFT_CLASS_COLORS: Record<AircraftClass, string> = {
  commercial: '#6C8EB5', // steel blue
  private: '#7FA37A', // sage green
  helicopter: '#C68A4E', // muted copper
  military: '#8A8F6B', // olive drab
  other: '#6B7280', // slate grey
};

const NIGHT_MAP_STYLE: unknown[] = [
  { elementType: 'geometry', stylers: [{ color: '#0d1119' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7684' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0d12' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#232a35' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#2b3341' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#10141c' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#191f28' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#10141c' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#232a35' }] },
  { featureType: 'road.arterial', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#080b10' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a5563' }] },
];

export const theme = {
  background: '#0a0d12',
  surface: '#12161d',
  surfaceAlt: '#191f28',
  border: '#232a35',
  text: '#e7eaee',
  textMuted: '#838c99',
  primary: '#6c8eb5',
  danger: '#c1666b',
  success: '#6fa787',
  amber: '#c9a24a',
  tabBar: '#0e1319',
  mapStyle: NIGHT_MAP_STYLE,
};

export type Theme = typeof theme;
