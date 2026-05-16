import { useColorScheme } from 'react-native';

/**
 * Premium Design System with advanced theming.
 * Elevates the 5-color palette into a cohesive, sophisticated design language.
 * Supports both Light and Dark modes with guaranteed contrast.
 */

export const usePremiumTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { isDark, colors: isDark ? DARK_COLORS : LIGHT_COLORS };
};

export const DARK_COLORS = {
  gold: '#FFD700',
  gold_light: '#e8c547',
  gold_dark: '#b8860b',
  silver: '#c0c0c0',
  silver_light: '#e8e8e8',
  silver_dark: '#808080',
  red: '#dc2626',
  red_light: '#ef4444',
  red_dark: '#991b1b',
  white: '#ffffff',
  white_transparent: 'rgba(255,255,255,0.1)',
  white_semi: 'rgba(255,255,255,0.5)',
  black: '#0a0a0a',
  black_dark: '#000000',
  black_light: '#1a1a1a',
  primary: '#FFD700',
  secondary: '#c0c0c0',
  accent: '#dc2626',
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surface_elevated: '#2a2a2a',
  text_primary: '#ffffff',
  text_secondary: '#c0c0c0',
  text_tertiary: '#808080',
  border: 'rgba(192,192,192,0.2)',
  border_light: 'rgba(192,192,192,0.1)',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  glass_dark: 'rgba(10,10,10,0.7)',
  glass_light: 'rgba(255,255,255,0.1)',
  gradient_gold: ['#daa520', '#b8860b'],
  gradient_red: ['#dc2626', '#991b1b'],
  gradient_dark: ['#1a1a1a', '#0a0a0a'],
};

export const LIGHT_COLORS = {
  gold: '#daa520',
  gold_light: '#e8c547',
  gold_dark: '#b8860b',
  silver: '#888888',
  silver_light: '#c0c0c0',
  silver_dark: '#555555',
  red: '#dc2626',
  red_light: '#ef4444',
  red_dark: '#991b1b',
  white: '#ffffff',
  white_transparent: 'rgba(255,255,255,0.1)',
  white_semi: 'rgba(255,255,255,0.5)',
  black: '#1a1a1a',
  black_dark: '#000000',
  black_light: '#2a2a2a',
  primary: '#daa520',
  secondary: '#888888',
  accent: '#dc2626',
  background: '#f5f5f5',
  surface: '#ffffff',
  surface_elevated: '#eeeeee',
  text_primary: '#1a1a1a',
  text_secondary: '#444444',
  text_tertiary: '#777777',
  border: 'rgba(0,0,0,0.1)',
  border_light: 'rgba(0,0,0,0.05)',
  success: '#059669',
  warning: '#d97706',
  error: '#b91c1c',
  glass_dark: 'rgba(245,245,245,0.7)',
  glass_light: 'rgba(0,0,0,0.05)',
  gradient_gold: ['#daa520', '#b8860b'],
  gradient_red: ['#dc2626', '#991b1b'],
  gradient_dark: ['#eeeeee', '#f5f5f5'],
};

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40, letterSpacing: -0.5 },
  h2: { fontSize: 28, fontWeight: '700', lineHeight: 36, letterSpacing: -0.3 },
  h3: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  body_large: { fontSize: 18, fontWeight: '500', lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body_small: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: 0.3 },
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
};

export const BORDER_RADIUS = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  medium: {
    shadowColor: '#000000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  large: {
    shadowColor: '#000000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 12,
  },
};

export const ANIMATION_DURATIONS = {
  instant: 150, fast: 250, normal: 350, slow: 500, very_slow: 800,
};
