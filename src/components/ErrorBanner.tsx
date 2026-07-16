import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

export function ErrorBanner({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.danger }]}>
      <Ionicons name="warning-outline" size={16} color="#fff" />
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: { color: '#fff', fontSize: 12, flex: 1 },
});
