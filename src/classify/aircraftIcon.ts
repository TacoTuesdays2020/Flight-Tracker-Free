import type { AircraftClass, EmitterCategory, FlightState } from '../api/types';

export type AircraftIconType = 'airliner' | 'jet' | 'propeller' | 'helicopter' | 'military';

/**
 * Picks a silhouette for the map/list icon from OpenSky's ADS-B emitter
 * category (a reasonable proxy for airframe size/shape) plus the inferred
 * aircraft class. Category is the stronger signal where present; class only
 * breaks ties when category is missing or ambiguous.
 */
export function getAircraftIconType(flight: {
  aircraftClass: AircraftClass;
  category: EmitterCategory | null;
}): AircraftIconType {
  const { aircraftClass, category } = flight;

  if (category === 'rotorcraft') return 'helicopter';
  if (aircraftClass === 'military') return 'military';
  if (category === 'heavy' || category === 'large' || category === 'high_vortex_large') {
    return 'airliner';
  }
  if (category === 'high_performance') return 'jet';
  if (category === 'light' || category === 'small' || category === 'glider') return 'propeller';

  if (aircraftClass === 'commercial') return 'airliner';
  if (aircraftClass === 'private') return 'propeller';

  return 'propeller';
}

export function getFlightIconType(flight: FlightState): AircraftIconType {
  return getAircraftIconType(flight);
}
