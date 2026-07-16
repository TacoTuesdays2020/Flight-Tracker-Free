import type { AircraftInfo, RouteInfo } from './types';

/**
 * Aircraft registration/type and scheduled-route lookups via hexdb.io, a
 * free, keyless database keyed off the ICAO24 hex address / IATA callsign.
 * Both endpoints are best-effort: coverage is partial (skews toward
 * commercial/registered aircraft) and hexdb returns plain "unknown" bodies
 * for misses, so every field is nullable and failures are swallowed rather
 * than surfaced as errors.
 */

const aircraftCache = new Map<string, AircraftInfo | null>();
const routeCache = new Map<string, RouteInfo | null>();

async function safeJsonFetch<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const text = await response.text();
    if (!text || text.trim().toLowerCase().startsWith('unknown')) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

interface HexDbAircraft {
  ICAOTypeCode?: string;
  Manufacturer?: string;
  ModeS?: string;
  OperatorFlagCode?: string;
  RegisteredOwners?: string;
  Registration?: string;
  Type?: string;
}

export async function getAircraftInfo(icao24: string): Promise<AircraftInfo | null> {
  const key = icao24.toLowerCase();
  if (aircraftCache.has(key)) return aircraftCache.get(key) ?? null;

  const data = await safeJsonFetch<HexDbAircraft>(`https://hexdb.io/api/v1/aircraft/${key}`);

  const info: AircraftInfo | null = data
    ? {
        icao24: key,
        registration: data.Registration?.trim() || null,
        manufacturer: data.Manufacturer?.trim() || null,
        model: data.Type?.trim() || null,
        typeCode: data.ICAOTypeCode?.trim() || null,
        operator: data.OperatorFlagCode?.trim() || null,
        owner: data.RegisteredOwners?.trim() || null,
      }
    : null;

  aircraftCache.set(key, info);
  return info;
}

interface HexDbRoute {
  flight?: string;
  route?: string;
  updatetime?: number;
}

export async function getRouteInfo(callsign: string): Promise<RouteInfo | null> {
  const key = callsign.trim().toUpperCase();
  if (!key) return null;
  if (routeCache.has(key)) return routeCache.get(key) ?? null;

  const data = await safeJsonFetch<HexDbRoute>(`https://hexdb.io/api/v1/route/iata/${key}`);

  let info: RouteInfo | null = null;
  if (data?.route) {
    const [origin, destination] = data.route.split('-').map((s) => s.trim());
    info = {
      flightNumber: data.flight?.trim() || key,
      originAirport: origin || null,
      destinationAirport: destination || null,
    };
  }

  routeCache.set(key, info);
  return info;
}
