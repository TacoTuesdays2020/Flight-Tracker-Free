import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { AircraftClass } from '../api/types';
import { AIRCRAFT_CLASS_LABELS, AIRCRAFT_CLASS_ORDER } from '../classify/aircraftType';
import { CLASS_REPRESENTATIVE_ICON } from '../classify/aircraftIcon';
import { AIRCRAFT_CLASS_COLORS } from '../theme/colors';
import { useTheme } from '../theme/useTheme';
import { GlossySurface } from './GlossySurface';
import { AircraftGlyph } from './icons/AircraftGlyph';

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
        const textColor = isSelected ? theme.onPrimary : theme.text;
        // Selected pill inverts to black-on-white, so the icon stays black
        // for legibility; unselected chips show the class's real accent.
        const iconColor = isSelected ? theme.onPrimary : AIRCRAFT_CLASS_COLORS[cls];
        return (
          <Pressable key={cls} onPress={() => onToggle(cls)}>
            <GlossySurface
              tint={isSelected ? 'light' : 'dark'}
              style={[styles.chip, !isSelected && { borderColor: theme.border, borderWidth: 1 }]}
            >
              <AircraftGlyph type={CLASS_REPRESENTATIVE_ICON[cls]} color={iconColor} size={15} />
              <Text style={[styles.label, { color: textColor }]}>
                {AIRCRAFT_CLASS_LABELS[cls]}
                {counts?.[cls] != null ? ` (${counts[cls]})` : ''}
              </Text>
            </GlossySurface>
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
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
