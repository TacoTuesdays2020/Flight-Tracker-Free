import type { AircraftClass } from '../api/types';

export const AIRCRAFT_CLASS_COLORS: Record<AircraftClass, string> = {
  commercial: '#2F80ED',
  private: '#27AE60',
  helicopter: '#F2994A',
  military: '#9B51E0',
  other: '#828282',
};

export const lightTheme = {
  mode: 'light' as const,
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F6',
  border: '#DFE3EA',
  text: '#0B1220',
  textMuted: '#5B6472',
  primary: '#2F80ED',
  danger: '#EB5757',
  success: '#27AE60',
  tabBar: '#FFFFFF',
  mapStyle: [] as unknown[],
};

export const darkTheme = {
  mode: 'dark' as const,
  background: '#0B1220',
  surface: '#141C2B',
  surfaceAlt: '#1C2637',
  border: '#26324A',
  text: '#F5F7FA',
  textMuted: '#8B95A7',
  primary: '#5B9EFF',
  danger: '#FF6B6B',
  success: '#4FD17B',
  tabBar: '#0F1626',
  mapStyle: [
    { elementType: 'geometry', stylers: [{ color: '#0B1220' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8B95A7' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0B1220' }] },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [{ color: '#26324A' }],
    },
    { featureType: 'road', stylers: [{ color: '#1C2637' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0F1B2E' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ] as unknown[],
};

export type Theme = typeof lightTheme;
