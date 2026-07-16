import { theme } from './colors';

// Flight Tracker Free is a deliberately single-theme (dark, muted) app —
// this hook exists so screens don't import the token object directly.
export function useTheme() {
  return theme;
}
