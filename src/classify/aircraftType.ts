import type { AircraftClass, EmitterCategory } from '../api/types';

/**
 * Best-effort classification of a live flight into commercial / private /
 * helicopter / military / other. OpenSky's ADS-B "category" field settles
 * the helicopter case reliably; everything else is inferred from the
 * callsign shape, since the free feed does not carry an authoritative
 * operator/type field. This is a heuristic, not a ground truth lookup, and
 * is surfaced to the user as such.
 */

// Airline callsigns follow ICAO flight-designator shape: 3-letter ICAO
// airline code + 1-4 digit flight number + optional single letter suffix.
// e.g. UAL123, DLH45A, BAW9, JBU2201
const COMMERCIAL_CALLSIGN = /^[A-Z]{3}\d{1,4}[A-Z]?$/;

// US civil registrations: N followed by 1-5 alphanumerics (first after N is a digit).
const US_TAIL_NUMBER = /^N[0-9][0-9A-Z]{0,4}$/;

// Common ICAO country-prefix civil registrations, e.g. G-ABCD, D-EFGH, VH-ABC, C-GABC.
const ICAO_TAIL_NUMBER = /^[A-Z]{1,2}-[A-Z0-9]{2,5}$/;

// A short, non-exhaustive set of military callsign prefixes/patterns used by
// several air forces for exercises and transport flights. Kept small and
// clearly heuristic rather than attempting to be authoritative.
const MILITARY_CALLSIGN_PREFIXES = [
  'RCH', // US Air Mobility Command
  'CNV', // US Navy
  'REACH',
  'NATO',
  'HOIST',
  'DUKE',
  'TANKER',
  'ASCOT', // UK RAF
  'RRR', // RAF
];

export function classifyAircraft(params: {
  category: EmitterCategory | null;
  callsign: string | null;
}): AircraftClass {
  const { category, callsign } = params;

  if (category === 'rotorcraft') return 'helicopter';
  if (category === 'uav' || category === 'space') return 'military';

  const trimmed = (callsign ?? '').trim().toUpperCase();
  if (!trimmed) return 'other';

  if (MILITARY_CALLSIGN_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return 'military';
  }

  if (COMMERCIAL_CALLSIGN.test(trimmed)) return 'commercial';

  if (US_TAIL_NUMBER.test(trimmed) || ICAO_TAIL_NUMBER.test(trimmed)) return 'private';

  return 'other';
}

export const AIRCRAFT_CLASS_LABELS: Record<AircraftClass, string> = {
  commercial: 'Commercial',
  private: 'Private / GA',
  helicopter: 'Helicopter',
  military: 'Military / Gov',
  other: 'Other',
};

export const AIRCRAFT_CLASS_ORDER: AircraftClass[] = [
  'commercial',
  'private',
  'helicopter',
  'military',
  'other',
];
