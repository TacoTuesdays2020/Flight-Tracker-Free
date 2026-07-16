import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/colors';

interface GlossySurfaceProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  /** 'light' = inverted white pill (primary/selected). 'dark' = glass-on-black (default surfaces). */
  tint?: 'light' | 'dark';
}

/**
 * A rounded surface with a soft specular highlight across its top third —
 * the "shine" that reads as glass/metal rather than a flat fill. Purely
 * cosmetic: the gradient sits above `children` with pointerEvents disabled
 * so it never blocks touches.
 */
export function GlossySurface({ style, children, tint = 'dark' }: GlossySurfaceProps) {
  const fill = tint === 'light' ? theme.primary : theme.surfaceAlt;
  const highlight =
    tint === 'light'
      ? ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.55)']
      : [theme.glossHigh, theme.glossLow];

  return (
    <View style={[{ backgroundColor: fill, overflow: 'hidden' }, style]}>
      {children}
      <LinearGradient
        pointerEvents="none"
        colors={highlight as [string, string]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
