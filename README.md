# Flight Tracker Free

A free, real-time flight & helicopter tracker for iOS and Android, built with
Expo / React Native + TypeScript. It shows live commercial, private, and
helicopter traffic on a map, with detailed per-aircraft telemetry, aircraft
identification, and route info — no paid API keys required.

## Features

- **Live map** of air traffic centered on your location, refreshing on a
  timer and re-querying as you pan/zoom, styled dark to match the rest of
  the app. Rendered with Leaflet inside a WebView (`src/components/map`)
  rather than `react-native-maps`, so it needs no native module compiled
  into the app — it runs in the stock Expo Go client with no custom dev
  build, using free CartoDB dark tiles over OpenStreetMap data (no API key).
- **Commercial / Private / Helicopter / Military / Other** filtering.
- **Type-specific aircraft icons** — marker *shape* reflects the airframe
  (airliner, private jet, small single-engine propeller/Cessna-style,
  helicopter, or military), inferred from OpenSky's ADS-B emitter category
  (see `src/classify/aircraftIcon.ts`). Commercial, military, and helicopter
  markers also carry a small accent color (orange/forest green/yellow);
  private and other stay in the neutral ink.
- **Pure black/white/grey UI** otherwise, with glossy, specular-highlighted
  buttons and frosted-glass surfaces (tab bar, pills).
- **Searchable flight list** sorted by distance, with the same filters.
- **Flight detail screen**: live position, altitude (baro + GPS), ground
  speed, heading, vertical rate, squawk, position source, a mini live-updating
  map with a breadcrumb track, plus aircraft registration/manufacturer/model
  and a best-effort scheduled route.
- **Favorites**, persisted on-device, with live telemetry refreshed on open.
- **Settings**: imperial/metric units, refresh interval, and an optional free
  OpenSky account (client id/secret) for a higher API rate limit.

## Data sources (all free)

| Source | Used for | Auth |
| --- | --- | --- |
| [OpenSky Network](https://opensky-network.org/) REST API | Live ADS-B/Mode-S state vectors (position, altitude, speed, heading, squawk, ADS-B emitter category) | None required; optional free client id/secret (Settings) raises the rate limit |
| [hexdb.io](https://hexdb.io/) | Aircraft registration/manufacturer/model by ICAO24 hex address, and scheduled route by callsign | None |

Both are free, keyless-by-default services with rate limits and partial
coverage (OpenSky depends on volunteer ADS-B receivers near the aircraft;
hexdb.io skews toward commercial/registered aircraft). The app is built to
degrade gracefully — missing fields render as "Unknown"/"—" rather than
erroring.

### Commercial / private / helicopter classification

OpenSky's free feed doesn't include an authoritative operator/aircraft-type
field, so classification (`src/classify/aircraftType.ts`) is a heuristic:

- **Helicopter**: ADS-B emitter category "rotorcraft" (from OpenSky's
  `category` field) — reliable when the aircraft transmits it.
- **Commercial**: callsign matches the ICAO flight-designator shape
  (3-letter airline code + flight number, e.g. `UAL123`).
- **Private**: callsign matches a civil tail-number shape (e.g. `N12345`,
  `G-ABCD`).
- **Military/Gov**: a small set of known military callsign prefixes, or
  UAV/space ADS-B categories.
- **Other**: everything else (no callsign, ambiguous shape, etc).

This is clearly surfaced to the user (see the Settings "About" section and
the disclaimer on the detail screen) rather than presented as ground truth.

## Getting started

```bash
npm install
npx expo start
```

Then open the app in Expo Go (scan the QR code) or run a native build:

```bash
npm run ios       # requires macOS + Xcode
npm run android   # requires Android Studio / an emulator or device
npm run web       # untested target; the app is built and verified for iOS/Android
```

Location permission is requested on first launch to center the map; if
denied, the map falls back to a continental-US view.

### Optional: raise your OpenSky rate limit

1. Create a free account at https://opensky-network.org.
2. Generate an API client under **My OpenSky → API Client**.
3. In the app, go to **Settings → OpenSky account** and paste the client ID
   and secret. They're stored on-device with `expo-secure-store`.

Without this, the app uses OpenSky's anonymous access, which is fine for
personal use but more tightly rate-limited.

## Project structure

```
App.tsx                     # Providers + root navigator
src/
  api/                       # OpenSky + hexdb.io clients and shared types
  classify/                  # Commercial/private/helicopter heuristic + icon-shape mapping
  components/                # WebView/Leaflet map, filter chips, list rows, info panels
  context/                   # Settings & Favorites (AsyncStorage/SecureStore)
  hooks/                     # useLiveFlights, useAircraftTelemetry, useAircraftDetails, useUserLocation
  navigation/                # Bottom tabs (Map/List/Favorites/Settings) + Detail stack screen
  screens/                   # Map, List, Detail, Favorites, Settings
  theme/                     # Pure black/white/grey palette + glossy surface tokens
  utils/                     # Unit formatting, distance calc
```

## Known limitations

- OpenSky coverage is crowd-sourced; low-altitude, remote, or lightly-covered
  areas will show fewer aircraft than exist in reality.
- Aircraft/route metadata from hexdb.io is best-effort and frequently
  `Unknown` for private, GA, and non-scheduled flights.
- Aircraft-class filtering is a heuristic, not authoritative operator data.
- The map's tiles and Leaflet script load from a CDN inside the WebView, so
  it needs the device to have a live internet connection (same as any other
  screen — the app has no offline map cache).
