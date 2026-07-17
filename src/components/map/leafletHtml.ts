import type { Region } from '../../hooks/useUserLocation';

/**
 * Approximates a Leaflet zoom level from a lat/lon delta "region", the same
 * shape react-native-maps used — keeps MapScreen/DetailScreen's region math
 * unchanged even though the map itself is now a Leaflet WebView.
 */
export function regionToZoom(region: { latitudeDelta: number; longitudeDelta: number }): number {
  const angle = Math.max(region.latitudeDelta, region.longitudeDelta, 0.0005);
  const zoom = Math.log2(360 / angle);
  return Math.min(18, Math.max(2, Math.round(zoom)));
}

// Same aircraft silhouettes as src/components/icons/AircraftGlyph.tsx,
// re-authored as plain JS since this string runs inside the WebView, not in
// the React Native runtime.
const GLYPHS_JS = `
  var GLYPHS = {
    airliner: function(c){
      return '<rect x="10.7" y="2" width="2.6" height="19" rx="1.3" fill="' + c + '"/>' +
             '<polygon points="1.5,16.5 22.5,16.5 15,10 9,10" fill="' + c + '"/>' +
             '<polygon points="8.5,20.5 15.5,20.5 12,17.5" fill="' + c + '"/>' +
             '<rect x="6.2" y="14.3" width="2.3" height="3.6" rx="1" fill="' + c + '"/>' +
             '<rect x="15.5" y="14.3" width="2.3" height="3.6" rx="1" fill="' + c + '"/>';
    },
    jet: function(c){
      return '<rect x="10.9" y="2.5" width="2.2" height="18.5" rx="1.1" fill="' + c + '"/>' +
             '<polygon points="4,18 20,18 13,13 11,13" fill="' + c + '"/>' +
             '<polygon points="10.6,21.5 13.4,21.5 12,18.3" fill="' + c + '"/>' +
             '<rect x="8.3" y="18.4" width="1.7" height="2.6" rx="0.85" fill="' + c + '"/>' +
             '<rect x="14" y="18.4" width="1.7" height="2.6" rx="0.85" fill="' + c + '"/>';
    },
    propeller: function(c){
      return '<circle cx="12" cy="3.4" r="1.3" fill="none" stroke="' + c + '" stroke-width="1.3"/>' +
             '<rect x="10.9" y="4.3" width="2.2" height="15.5" rx="1.1" fill="' + c + '"/>' +
             '<rect x="2" y="9.4" width="20" height="2.1" rx="1" fill="' + c + '"/>' +
             '<rect x="8.6" y="18.6" width="6.8" height="1.5" rx="0.75" fill="' + c + '"/>' +
             '<polygon points="10.9,19 13.1,19 12,15.8" fill="' + c + '"/>';
    },
    helicopter: function(c){
      return '<circle cx="12" cy="9" r="7" fill="none" stroke="' + c + '" stroke-width="1.3" stroke-dasharray="2.2 2.6" opacity="0.85"/>' +
             '<circle cx="12" cy="9" r="1.2" fill="' + c + '"/>' +
             '<rect x="10" y="8.6" width="4" height="6.4" rx="2" fill="' + c + '"/>' +
             '<rect x="11.3" y="14.6" width="1.4" height="6.6" rx="0.7" fill="' + c + '"/>' +
             '<circle cx="12" cy="21.2" r="1" fill="none" stroke="' + c + '" stroke-width="1"/>';
    },
    military: function(c){
      return '<rect x="11" y="2" width="2" height="19" rx="1" fill="' + c + '"/>' +
             '<polygon points="2,17.5 22,17.5 12.5,7.5 11.5,7.5" fill="' + c + '"/>' +
             '<polygon points="9.2,20.8 14.8,20.8 12,17.8" fill="' + c + '"/>';
    }
  };
`;

export interface BuildMapHtmlOptions {
  initialRegion: Region;
  interactive: boolean;
}

/**
 * A self-contained HTML page: Leaflet + free CartoDB dark tiles (no API key)
 * over OpenStreetMap data, plus a tiny message-passing protocol so the RN
 * side can push marker/track/camera updates without reloading the page.
 * This runs inside a react-native-webview, which — unlike react-native-maps
 * — needs no native module compiled into the host app, so it works in the
 * stock Expo Go client.
 */
export function buildMapHtml({ initialRegion, interactive }: BuildMapHtmlOptions): string {
  const zoom = regionToZoom(initialRegion);
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #000; }
  .leaflet-control-attribution { font-size: 9px; background: rgba(0,0,0,0.55) !important; color: #8e8e93 !important; }
  .leaflet-control-attribution a { color: #aeb4bd !important; }
  .leaflet-control-zoom { display: none !important; }
  .leaflet-marker-icon { background: none; border: none; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
  ${GLYPHS_JS}
  var INTERACTIVE = ${interactive ? 'true' : 'false'};
  var map = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    dragging: INTERACTIVE,
    touchZoom: INTERACTIVE,
    scrollWheelZoom: INTERACTIVE,
    doubleClickZoom: INTERACTIVE,
    boxZoom: INTERACTIVE,
    keyboard: false,
    tap: INTERACTIVE
  }).setView([${initialRegion.latitude}, ${initialRegion.longitude}], ${zoom});

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap, &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  var markersLayer = L.layerGroup().addTo(map);
  var trackLine = null;

  function post(msg){
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }

  function svgIcon(type, color, rotateDeg){
    var glyph = GLYPHS[type] || GLYPHS.propeller;
    return '<div style="width:26px;height:26px;transform:rotate(' + (rotateDeg || 0) + 'deg);">' +
      '<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' + glyph(color) + '</svg>' +
    '</div>';
  }

  function renderMarkers(flights){
    markersLayer.clearLayers();
    (flights || []).forEach(function(f){
      var icon = L.divIcon({ html: svgIcon(f.icon, f.color, f.rotation), className: 'aircraft-icon', iconSize: [26, 26], iconAnchor: [13, 13] });
      var m = L.marker([f.lat, f.lon], { icon: icon, interactive: INTERACTIVE, keyboard: false });
      if (INTERACTIVE) {
        m.on('click', function(){ post({ type: 'markerPress', id: f.id }); });
      }
      m.addTo(markersLayer);
    });
  }

  function renderTrack(coords, color){
    if (trackLine) { map.removeLayer(trackLine); trackLine = null; }
    if (coords && coords.length > 1) {
      trackLine = L.polyline(coords.map(function(c){ return [c.latitude, c.longitude]; }), {
        color: color || '#8e8e93', weight: 2, opacity: 0.7
      }).addTo(map);
    }
  }

  function onMessage(e){
    try {
      var data = JSON.parse(e.data);
      if (data.type === 'setMarkers') renderMarkers(data.flights);
      else if (data.type === 'setTrack') renderTrack(data.coords, data.color);
      else if (data.type === 'setView') map.setView([data.lat, data.lon], data.zoom, { animate: true });
    } catch (err) {}
  }
  document.addEventListener('message', onMessage);
  window.addEventListener('message', onMessage);

  if (INTERACTIVE) {
    map.on('moveend', function(){
      var c = map.getCenter();
      var b = map.getBounds();
      post({
        type: 'regionChange',
        latitude: c.lat,
        longitude: c.lng,
        latitudeDelta: Math.abs(b.getNorth() - b.getSouth()),
        longitudeDelta: Math.abs(b.getEast() - b.getWest())
      });
    });
  }

  post({ type: 'ready' });
})();
</script>
</body>
</html>`;
}
