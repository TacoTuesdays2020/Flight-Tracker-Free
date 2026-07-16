import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';
import type { AircraftIconType } from '../../classify/aircraftIcon';

interface GlyphProps {
  color: string;
  size: number;
}

/** Twin-engine swept-wing widebody/narrowbody — the shape of scheduled commercial traffic. */
function AirlinerGlyph({ color, size }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="10.7" y="2" width="2.6" height="19" rx="1.3" fill={color} />
      <Polygon points="1.5,16.5 22.5,16.5 15,10 9,10" fill={color} />
      <Polygon points="8.5,20.5 15.5,20.5 12,17.5" fill={color} />
      <Rect x="6.2" y="14.3" width="2.3" height="3.6" rx="1" fill={color} />
      <Rect x="15.5" y="14.3" width="2.3" height="3.6" rx="1" fill={color} />
    </Svg>
  );
}

/** Slender business jet — small swept wings set aft, tail-mounted engines, no wing pods. */
function JetGlyph({ color, size }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="10.9" y="2.5" width="2.2" height="18.5" rx="1.1" fill={color} />
      <Polygon points="4,18 20,18 13,13 11,13" fill={color} />
      <Polygon points="10.6,21.5 13.4,21.5 12,18.3" fill={color} />
      <Rect x="8.3" y="18.4" width="1.7" height="2.6" rx="0.85" fill={color} />
      <Rect x="14" y="18.4" width="1.7" height="2.6" rx="0.85" fill={color} />
    </Svg>
  );
}

/** High-wing single-engine GA aircraft — the Cessna 172 top-down silhouette. */
function PropellerGlyph({ color, size }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="3.4" r="1.3" fill="none" stroke={color} strokeWidth="1.3" />
      <Rect x="10.9" y="4.3" width="2.2" height="15.5" rx="1.1" fill={color} />
      <Rect x="2" y="9.4" width="20" height="2.1" rx="1" fill={color} />
      <Rect x="8.6" y="18.6" width="6.8" height="1.5" rx="0.75" fill={color} />
      <Polygon points="10.9,19 13.1,19 12,15.8" fill={color} />
    </Svg>
  );
}

/** Top-down helicopter: rotor disc + mast, cabin, tail boom and tail rotor. */
function HelicopterGlyph({ color, size }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="9"
        r="7"
        fill="none"
        stroke={color}
        strokeWidth="1.3"
        strokeDasharray="2.2 2.6"
        opacity={0.85}
      />
      <Circle cx="12" cy="9" r="1.2" fill={color} />
      <Rect x="10" y="8.6" width="4" height="6.4" rx="2" fill={color} />
      <Rect x="11.3" y="14.6" width="1.4" height="6.6" rx="0.7" fill={color} />
      <Circle cx="12" cy="21.2" r="1" fill="none" stroke={color} strokeWidth="1" />
    </Svg>
  );
}

/** Angular delta-wing silhouette for fast military/government traffic. */
function MilitaryGlyph({ color, size }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="11" y="2" width="2" height="19" rx="1" fill={color} />
      <Polygon points="2,17.5 22,17.5 12.5,7.5 11.5,7.5" fill={color} />
      <Polygon points="9.2,20.8 14.8,20.8 12,17.8" fill={color} />
    </Svg>
  );
}

const GLYPHS: Record<AircraftIconType, (props: GlyphProps) => React.ReactElement> = {
  airliner: AirlinerGlyph,
  jet: JetGlyph,
  propeller: PropellerGlyph,
  helicopter: HelicopterGlyph,
  military: MilitaryGlyph,
};

interface AircraftGlyphProps {
  type: AircraftIconType;
  color: string;
  size?: number;
  /** Heading in degrees; the glyph is authored nose-up (0deg = north). */
  rotationDeg?: number;
}

export function AircraftGlyph({ type, color, size = 22, rotationDeg = 0 }: AircraftGlyphProps) {
  const Glyph = GLYPHS[type];
  return (
    <View style={{ transform: [{ rotate: `${rotationDeg}deg` }] }}>
      <Glyph color={color} size={size} />
    </View>
  );
}
