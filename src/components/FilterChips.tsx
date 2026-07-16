import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AircraftClass } from '../api/types';
import { AIRCRAFT_CLASS_LABELS, AIRCRAFT_CLASS_ORDER } from '../classify/aircraftType';
import { AIRCRAFT_CLASS_COLORS } from '../theme/colors';
import { useTheme } from '../theme/useTheme';

interface FilterChipsProps {
  selected: Set<AircraftClass>;
  onToggle: (aircraftClass: AircraftClass) => void;
  counts?: Partial<Record<AircraftClass, number>>;
}

export function FilterChips({ selected, onToggle, counts }: FilterChipsProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {AIRCRAFT_CLASS_ORDER.map((cls) => {
        const isSelected = selected.has(cls);
        const color = AIRCRAFT_CLASS_COLORS[cls];
        return (
          <Pressable
            key={cls}
            onPress={() => onToggle(cls)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? color : theme.surface,
                borderColor: color,
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: isSelected ? '#fff' : color }]} />
            <Text style={[styles.label, { color: isSelected ? '#fff' : theme.text }]}>
              {AIRCRAFT_CLASS_LABELS[cls]}
              {counts?.[cls] != null ? ` (${counts[cls]})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
