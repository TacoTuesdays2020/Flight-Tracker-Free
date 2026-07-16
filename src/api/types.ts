/**
 * Shared types for live air-traffic data pulled from the OpenSky Network
 * REST API (https://openskynetwork.github.io/opensky-api/rest.html).
 */

export type AircraftClass = 'commercial' | 'private' | 'helicopter' | 'military' | 'other';

export type PositionSource = 'ADS-B' | 'ASTERIX' | 'MLAT' | 'FLARM' | 'unknown';

/** ADS-B emitter category reported by OpenSky (index 17 of a raw state vector). */
export type EmitterCategory =
  | 'no_info'
  | 'no_category_info'
  | 'light'
  | 'small'
  | 'large'
  | 'high_vortex_large'
  | 'heavy'
  | 'high_performance'
  | 'rotorcraft'
  | 'glider'
  | 'lighter_than_air'
  | 'parachutist'
  | 'ultralight'
  | 'reserved'
  | 'uav'
  | 'space'
  | 'surface_emergency'
  | 'surface_service'
  | 'point_obstacle'
  | 'cluster_obstacle'
  | 'line_obstacle';

export const EMITTER_CATEGORY_LABELS: Record<EmitterCategory, string> = {
  no_info: 'No information',
  no_category_info: 'No ADS-B category info',
  light: 'Light (< 15,500 lbs)',
  small: 'Small (15,500–75,000 lbs)',
  large: 'Large (75,000–300,000 lbs)',
  high_vortex_large: 'High vortex large',
  heavy: 'Heavy (> 300,000 lbs)',
  high_performance: 'High performance',
  rotorcraft: 'Rotorcraft / helicopter',
  glider: 'Glider / sailplane',
  lighter_than_air: 'Lighter-than-air',
  parachutist: 'Parachutist / skydiver',
  ultralight: 'Ultralight / hang-glider',
  reserved: 'Reserved',
  uav: 'Unmanned aerial vehicle',
  space: 'Space / trans-atmospheric',
  surface_emergency: 'Surface vehicle (emergency)',
  surface_service: 'Surface vehicle (service)',
  point_obstacle: 'Point obstacle',
  cluster_obstacle: 'Cluster obstacle',
  line_obstacle: 'Line obstacle',
};

const EMITTER_CATEGORY_BY_INDEX: EmitterCategory[] = [
  'no_info',
  'no_category_info',
  'light',
  'small',
  'large',
  'high_vortex_large',
  'heavy',
  'high_performance',
  'rotorcraft',
  'glider',
  'lighter_than_air',
  'parachutist',
  'ultralight',
  'reserved',
  'uav',
  'space',
  'surface_emergency',
  'surface_service',
  'point_obstacle',
  'cluster_obstacle',
  'line_obstacle',
];

export function emitterCategoryFromIndex(index: number | null | undefined): EmitterCategory | null {
  if (index == null || index < 0 || index >= EMITTER_CATEGORY_BY_INDEX.length) return null;
  return EMITTER_CATEGORY_BY_INDEX[index];
}

/** A single live aircraft state vector, normalized from OpenSky's raw array format. */
export interface FlightState {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  timePosition: number | null;
  lastContact: number;
  longitude: number | null;
  latitude: number | null;
  baroAltitude: number | null;
  onGround: boolean;
  velocity: number | null;
  trueTrack: number | null;
  verticalRate: number | null;
  geoAltitude: number | null;
  squawk: string | null;
  spi: boolean;
  positionSource: PositionSource;
  category: EmitterCategory | null;
  aircraftClass: AircraftClass;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

/** Aircraft registration/type metadata, resolved from the ICAO24 hex address. */
export interface AircraftInfo {
  icao24: string;
  registration: string | null;
  manufacturer: string | null;
  model: string | null;
  typeCode: string | null;
  operator: string | null;
  owner: string | null;
}

/** Scheduled route inferred from a flight's callsign (best-effort, may be null). */
export interface RouteInfo {
  flightNumber: string | null;
  originAirport: string | null;
  destinationAirport: string | null;
}
