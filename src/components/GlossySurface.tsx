import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GlossySurfaceProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  /** 'high' = brighter, more opaque glass for selected/primary state. 'low' = subtle default glass. */
  intensity?: 'low' | 'high';
}

/**
 * True frosted glass, not a flat colored fill: a BlurView refracts whatever
 * sits behind it, a translucent white wash tints that blur, a specular
 * gradient streaks across the top third, and a bright hairline traces the
 * rim — the "Liquid Glass" pill/circle look. `intensity` only changes how
 * milky/bright the glass reads; content color (white) stays constant.
 */
export function GlossySurface({ style, children, intensity = 'low' }: GlossySurfaceProps) {
  const fillOpacity = intensity === 'high' ? 0.3 : 0.1;
  const rimOpacity = intensity === 'high' ? 0.6 : 0.35;

  return (
    <View style={[styles.clip, { borderWidth: 1, borderColor: `rgba(255,255,255,${rimOpacity})` }, style]}>
      <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255,255,255,${fillOpacity})` }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.65 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.18)']}
        start={{ x: 0.5, y: 0.72 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
