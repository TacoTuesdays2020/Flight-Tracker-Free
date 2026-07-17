import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { buildMapHtml, regionToZoom } from './leafletHtml';
import { useTheme } from '../../theme/useTheme';
import type { Region } from '../../hooks/useUserLocation';
import type { AircraftIconType } from '../../classify/aircraftIcon';

export interface MapMarkerInput {
  id: string;
  latitude: number;
  longitude: number;
  iconType: AircraftIconType;
  color: string;
  rotationDeg: number;
}

export interface LeafletMapViewHandle {
  animateToRegion: (region: Region) => void;
}

interface LeafletMapViewProps {
  initialRegion: Region;
  markers: MapMarkerInput[];
  track?: { latitude: number; longitude: number }[];
  trackColor?: string;
  /** Pannable/zoomable with a tap handler on markers. Off for the read-only detail preview. */
  interactive?: boolean;
  /** When true, the camera re-centers on `region` every time it changes — for the detail screen's live-follow preview, never for the main pannable map. */
  followRegion?: boolean;
  region?: Region;
  onMarkerPress?: (id: string) => void;
  onRegionChange?: (region: Region) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * A Leaflet map rendered inside a WebView, standing in for react-native-maps.
 * react-native-maps needs native code compiled into the host app, which the
 * stock Expo Go client doesn't have; a WebView is a core Expo Go module, so
 * this renders correctly with zero native build step.
 */
export const LeafletMapView = forwardRef<LeafletMapViewHandle, LeafletMapViewProps>(
  function LeafletMapView(
    { initialRegion, markers, track, trackColor, interactive = true, followRegion = false, region, onMarkerPress, onRegionChange, style },
    ref
  ) {
    const theme = useTheme();
    const webviewRef = useRef<WebView>(null);
    const readyRef = useRef(false);
    const queueRef = useRef<string[]>([]);
    const [ready, setReady] = useState(false);

    // Built once from the region at mount time; later camera moves go through
    // postMessage rather than reloading the page.
    const html = useMemo(
      () => buildMapHtml({ initialRegion, interactive }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const send = useCallback((msg: Record<string, unknown>) => {
      const payload = JSON.stringify(msg);
      if (readyRef.current) {
        webviewRef.current?.postMessage(payload);
      } else {
        queueRef.current.push(payload);
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        animateToRegion: (nextRegion: Region) => {
          send({ type: 'setView', lat: nextRegion.latitude, lon: nextRegion.longitude, zoom: regionToZoom(nextRegion) });
        },
      }),
      [send]
    );

    useEffect(() => {
      send({
        type: 'setMarkers',
        flights: markers.map((m) => ({
          id: m.id,
          lat: m.latitude,
          lon: m.longitude,
          icon: m.iconType,
          color: m.color,
          rotation: m.rotationDeg,
        })),
      });
    }, [markers, send]);

    useEffect(() => {
      send({ type: 'setTrack', coords: track ?? [], color: trackColor });
    }, [track, trackColor, send]);

    useEffect(() => {
      if (!followRegion || !region) return;
      send({ type: 'setView', lat: region.latitude, lon: region.longitude, zoom: regionToZoom(region) });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [followRegion, region?.latitude, region?.longitude, send]);

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'ready') {
            readyRef.current = true;
            setReady(true);
            queueRef.current.forEach((payload) => webviewRef.current?.postMessage(payload));
            queueRef.current = [];
          } else if (data.type === 'markerPress') {
            onMarkerPress?.(data.id);
          } else if (data.type === 'regionChange') {
            onRegionChange?.({
              latitude: data.latitude,
              longitude: data.longitude,
              latitudeDelta: data.latitudeDelta,
              longitudeDelta: data.longitudeDelta,
            });
          }
        } catch {
          // ignore malformed messages
        }
      },
      [onMarkerPress, onRegionChange]
    );

    return (
      <View style={[styles.flex, style, { backgroundColor: theme.background }]} pointerEvents={interactive ? 'auto' : 'none'}>
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          style={styles.flex}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
        {!ready && (
          <View style={[StyleSheet.absoluteFill, styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator color={theme.primary} />
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { alignItems: 'center', justifyContent: 'center' },
});
