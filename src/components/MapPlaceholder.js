import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapView({ children, style }) {
  return (
    <View style={[styles.map, style]}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.label}>Map preview unavailable in Expo Go</Text>
      <Text style={styles.sub}>Use a development build to see live maps</Text>
      {children}
    </View>
  );
}

export function Marker({ children }) {
  return <View>{children}</View>;
}

export function Polyline() {
  return null;
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  icon: { fontSize: 48, marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#555', textAlign: 'center' },
  sub: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
});
