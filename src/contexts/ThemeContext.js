/**
 * NOTE: This context manages the application's theme (Light/Dark mode).
 * Key Features:
 * - System-Aware: Automatically detects and applies the user's device theme on launch.
 * - Centralized Styling Hook: Exports `useThemedStyles`, a custom hook that components
 *   use to get theme-aware styles. This is a powerful pattern that keeps styling logic
 *   clean and colocated with the component, while ensuring it's theme-responsive.
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';

const LIGHT = {
  primary: '#FFD700', danger: '#FF3B30', success: '#34C759', warning: '#FF9500',
  background: '#F5F5F5', card: '#FFFFFF', text: '#1A1A1A', textSecondary: '#666666',
  border: '#E0E0E0', tabInactive: '#999999',
};

const DARK = {
  primary: '#FFD700', danger: '#FF453A', success: '#30D158', warning: '#FF9F0A',
  background: '#0F0F0F', card: '#1A1A1A', text: '#FFFFFF', textSecondary: '#AAAAAA',
  border: '#2A2A2A', tabInactive: '#666666',
};

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const systemTheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemTheme === 'dark');

  useEffect(() => {
    setIsDark(systemTheme === 'dark');
  }, [systemTheme]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const colors = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export function useThemedStyles(createStylesFn) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => StyleSheet.create(createStylesFn(colors, isDark)), [colors, isDark, createStylesFn]);
  return { styles, colors, isDark };
}
