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
};

export type Theme = typeof theme;
