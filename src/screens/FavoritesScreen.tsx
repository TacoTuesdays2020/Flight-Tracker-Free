import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { TabScreenProps } from '../navigation/types';
import { useFavorites, type FavoriteEntry } from '../context/FavoritesContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../theme/useTheme';
import { fetchStatesByIcao24 } from '../api/openSky';
import type { FlightState } from '../api/types';
import { FlightListItem } from '../components/FlightListItem';
import { LoadingView } from '../components/LoadingView';

type Props = TabScreenProps<'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const theme = useTheme();
  const { favorites, loaded, toggleFavorite } = useFavorites();
  const { credentials } = useSettings();
  const [liveByIcao, setLiveByIcao] = useState<Record<string, FlightState>>({});
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (favorites.length === 0) {
      setLiveByIcao({});
      return;
    }
    setRefreshing(true);
    try {
      const { states } = await fetchStatesByIcao24(
        favorites.map((f) => f.icao24),
        credentials
      );
      const map: Record<string, FlightState> = {};
      for (const s of states) map[s.icao24] = s;
      setLiveByIcao(map);
    } catch {
      // Keep last known telemetry on failure.
    } finally {
      setRefreshing(false);
    }
  }, [favorites, credentials]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!loaded) return <LoadingView />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {favorites.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="star-outline" size={36} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Tap the star on a flight's detail page to save it here for quick access.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.icao24}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          renderItem={({ item }) => (
            <FavoriteRow
              item={item}
              live={liveByIcao[item.icao24]}
              onPress={() =>
                navigation.navigate('Detail', { icao24: item.icao24, callsign: item.callsign })
              }
              onRemove={() => toggleFavorite(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );
}

function FavoriteRow({
  item,
  live,
  onPress,
  onRemove,
}: {
  item: FavoriteEntry;
  live?: FlightState;
  onPress: () => void;
  onRemove: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        {live ? (
          <FlightListItem flight={live} onPress={onPress} />
        ) : (
          <Pressable
            onPress={onPress}
            style={[styles.offlineRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={styles.offlineInfo}>
              <Text style={[styles.offlineCallsign, { color: theme.text }]}>
                {item.callsign?.trim() || item.icao24.toUpperCase()}
              </Text>
              <Text style={[styles.offlineSubtitle, { color: theme.textMuted }]}>
                No live position right now
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </Pressable>
        )}
      </View>
      <Pressable onPress={onRemove} hitSlop={10} style={styles.removeButton}>
        <Ionicons name="trash-outline" size={18} color={theme.danger} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeButton: { padding: 4 },
  container: { flex: 1 },
  list: { padding: 12, gap: 8 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyText: { textAlign: 'center', fontSize: 13 },
  offlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  offlineInfo: { gap: 2 },
  offlineCallsign: { fontSize: 15, fontWeight: '700' },
  offlineSubtitle: { fontSize: 12 },
});
