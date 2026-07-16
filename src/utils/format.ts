export type Units = 'imperial' | 'metric';

const METERS_TO_FEET = 3.28084;
const MPS_TO_KNOTS = 1.94384;
const MPS_TO_KMH = 3.6;
const MPS_TO_FPM = 196.85;

export function formatAltitude(meters: number | null, units: Units): string {
  if (meters == null) return '—';
  if (units === 'imperial') return `${Math.round(meters * METERS_TO_FEET).toLocaleString()} ft`;
  return `${Math.round(meters).toLocaleString()} m`;
}

export function formatSpeed(metersPerSecond: number | null, units: Units): string {
  if (metersPerSecond == null) return '—';
  if (units === 'imperial') return `${Math.round(metersPerSecond * MPS_TO_KNOTS)} kts`;
  return `${Math.round(metersPerSecond * MPS_TO_KMH)} km/h`;
}

export function formatVerticalRate(metersPerSecond: number | null, units: Units): string {
  if (metersPerSecond == null) return '—';
  const value =
    units === 'imperial'
      ? Math.round(metersPerSecond * MPS_TO_FPM)
      : Math.round(metersPerSecond * 60);
  const unitLabel = units === 'imperial' ? 'ft/min' : 'm/min';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString()} ${unitLabel}`;
}

export function formatHeading(degrees: number | null): string {
  if (degrees == null) return '—';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return `${Math.round(degrees)}° ${directions[index]}`;
}

export function formatCoordinate(value: number | null, axis: 'lat' | 'lon'): string {
  if (value == null) return '—';
  const hemisphere = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
  return `${Math.abs(value).toFixed(3)}° ${hemisphere}`;
}

export function formatLastContact(epochSeconds: number): string {
  if (!epochSeconds) return '—';
  const seconds = Math.max(0, Math.round(Date.now() / 1000 - epochSeconds));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

export function haversineDistanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number, units: Units): string {
  if (units === 'imperial') return `${Math.round(km * 0.621371)} mi`;
  return `${Math.round(km)} km`;
}
