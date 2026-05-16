// Minimal design tokens for ported v3 screens
// Re-exports theme values + constants that v3 screens expect

import { useTheme } from '../contexts/ThemeContext';

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const radius = {
  sm: 6, md: 12, lg: 16, xl: 24, full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' },
  h2: { fontSize: 22, fontWeight: '700' },
  h3: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '500' },
  button: { fontSize: 16, fontWeight: '700' },
};

export const serviceCategories = [
  { id: 'gas', name: 'Gas Delivery', icon: '🔥', color: '#FF5722' },
  { id: 'water', name: 'Water Delivery', icon: '💧', color: '#2196F3' },
  { id: 'carpenter', name: 'Carpenter', icon: '🔨', color: '#795548' },
  { id: 'plumber', name: 'Plumber', icon: '🚿', color: '#00BCD4' },
  { id: 'electrician', name: 'Electrician', icon: '⚡', color: '#FFC107' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', color: '#4CAF50' },
  { id: 'mechanic', name: 'Mechanic', icon: '🔧', color: '#607D8B' },
  { id: 'tailor', name: 'Tailor', icon: '🪡', color: '#E91E63' },
];

export const statusColors = {
  pending: '#FF9800',
  accepted: '#2196F3',
  in_progress: '#9C27B0',
  completed: '#4CAF50',
  cancelled: '#F44336',
};

// colors re-exported from ThemeContext for compatibility
// v3 screens import { colors } from '../../theme/designTokens'
// We provide a static palette matching the light theme
export const colors = {
  primary: '#FFD700',
  danger: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  tabInactive: '#999999',
};
