import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function ServiceCategoriesScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔧</Text>
      <Text style={styles.title}>Coming Soon</Text>
      <Text style={styles.subtitle}>The Services Marketplace will be available in a future update.</Text>
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background, padding: 24 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: C.textSecondary, textAlign: 'center' },
});
