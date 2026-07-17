import type { BoundingBox, FlightState } from './types';
import { emitterCategoryFromIndex } from './types';
import { classifyAircraft } from '../classify/aircraftType';

const STATES_URL = 'https://opensky-network.org/api/states/all';
const TOKEN_URL =
  'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

export class OpenSkyRateLimitError extends Error {
  constructor(retryAfterSeconds?: number) {
    super(
      retryAfterSeconds
        ? `OpenSky rate limit hit, retry after ${retryAfterSeconds}s`
        : 'OpenSky rate limit hit'
    );
    this.name = 'OpenSkyRateLimitError';
  }
}

export class OpenSkyError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'OpenSkyError';
  }
}

export interface OpenSkyCredentials {
  clientId: string;
  clientSecret: string;
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

/**
 * Exchanges an OpenSky OAuth2 client id/secret (from a free
 * opensky-network.org account) for a bearer token, caching it until shortly
 * before expiry. Registered users get a much higher API rate limit than
 * anonymous access. Falls back to null (anonymous) if no credentials are
 * configured or the exchange fails.
 */
async function getAccessToken(credentials: OpenSkyCredentials | null): Promise<string | null> {
  if (!credentials || !credentials.clientId || !credentials.clientSecret) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 5_000) {
    return cachedToken.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    // Bad/expired credentials: fall back to anonymous rather than hard-failing.
    cachedToken = null;
    return null;
  }

  const json = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.accessToken;
}

function parseStateVector(raw: unknown[]): FlightState | null {
  const icao24 = raw[0] as string | null;
  if (!icao24) return null;

  const rawCategory = raw[17] as number | undefined;
  const category = emitterCategoryFromIndex(rawCategory);
  const callsign = raw[1] != null ? String(raw[1]).trim() || null : null;

  const positionSourceRaw = raw[16] as number | undefined;
  const positionSource =
    positionSourceRaw === 0
      ? 'ADS-B'
      : positionSourceRaw === 1
      ? 'ASTERIX'
      : positionSourceRaw === 2
      ? 'MLAT'
      : positionSourceRaw === 3
      ? 'FLARM'
      : 'unknown';

  return {
    icao24,
    callsign,
    originCountry: (raw[2] as string) ?? 'Unknown',
    timePosition: (raw[3] as number | null) ?? null,
    lastContact: (raw[4] as number) ?? 0,
    longitude: (raw[5] as number | null) ?? null,
    latitude: (raw[6] as number | null) ?? null,
    baroAltitude: (raw[7] as number | null) ?? null,
    onGround: Boolean(raw[8]),
    velocity: (raw[9] as number | null) ?? null,
    trueTrack: (raw[10] as number | null) ?? null,
    verticalRate: (raw[11] as number | null) ?? null,
    geoAltitude: (raw[13] as number | null) ?? null,
    squawk: (raw[14] as string | null) ?? null,
    spi: Boolean(raw[15]),
    positionSource,
    category,
    aircraftClass: classifyAircraft({ category, callsign }),
  };
}

async function fetchStates(params: URLSearchParams, credentials: OpenSkyCredentials | null) {
  const token = await getAccessToken(credentials).catch(() => null);

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${STATES_URL}?${params.toString()}`, { headers });

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('Retry-After')) || undefined;
    throw new OpenSkyRateLimitError(retryAfter);
  }
  if (!response.ok) {
    throw new OpenSkyError(`OpenSky request failed (${response.status})`, response.status);
  }

  const json = (await response.json()) as { time: number; states: unknown[][] | null };
  const states = (json.states ?? [])
    .map((raw) => parseStateVector(raw))
    .filter((s): s is FlightState => s !== null && s.latitude != null && s.longitude != null);

  return { time: json.time, states };
}

/** Fetches all live flight states within a lat/lon bounding box. */
export async function fetchStatesInBoundingBox(
  box: BoundingBox,
  credentials: OpenSkyCredentials | null = null
) {
  const params = new URLSearchParams({
    lamin: box.minLat.toFixed(4),
    lomin: box.minLon.toFixed(4),
    lamax: box.maxLat.toFixed(4),
    lomax: box.maxLon.toFixed(4),
  });
  return fetchStates(params, credentials);
}

/** Fetches live state(s) for one or more specific aircraft by ICAO24 address. */
export async function fetchStatesByIcao24(
  icao24s: string[],
  credentials: OpenSkyCredentials | null = null
) {
  const params = new URLSearchParams();
  icao24s.forEach((id) => params.append('icao24', id.toLowerCase()));
  return fetchStates(params, credentials);
}
