import { useTheme } from '../../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import client from '../../api/client';

export default function RideHistoryScreen() {
  const { colors } = useTheme();
  const COLORS = colors;
  const styles = createStyles(colors);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    (async () => {
      try { const { data } = await client.get('/rides'); setRides(data.data || []); } catch {}
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ride History</Text>
      {rides.length === 0 && <Text style={styles.empty}>No rides yet</Text>}
      {rides.map((r) => (
        <View key={r.id} style={styles.card}>
          <View style={styles.row}><Text style={styles.status}>{r.status}</Text><Text style={styles.fare}>${(r.fare || 0).toFixed(2)}</Text></View>
          <Text style={styles.dist}>{(r.distance || 0).toFixed(1)} km • {r.vehicleType}</Text>
          <Text style={styles.date}>{new Date(r.createdAt).toLocaleDateString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 16 },
  empty: { color: C.textSecondary, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  status: { color: C.primary, fontWeight: '600' },
  fare: { color: C.text, fontWeight: '700', fontSize: 18 },
  dist: { color: C.textSecondary, fontSize: 13 },
  date: { color: C.textSecondary, fontSize: 12, marginTop: 4 },
});
