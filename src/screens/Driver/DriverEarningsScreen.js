import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/client';

export default function DriverEarningsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [earnings, setEarnings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = async () => {
    try {
      const { data } = await api.get('/drivers/earnings');
      setEarnings(data?.data || data || []);
    } catch {}
  };

  useEffect(() => { fetchEarnings(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  const total = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Earnings</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Earnings</Text>
        <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
      </View>
      {earnings.map((e) => (
        <View key={e.id} style={styles.card}>
          <Text style={styles.amount}>+${(e.amount || 0).toFixed(2)}</Text>
          <Text style={styles.date}>{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ''}</Text>
        </View>
      ))}
      {earnings.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No earnings yet</Text>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, paddingTop: 50, color: C.text },
  summaryCard: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
    elevation: 2,
  },
  summaryLabel: { fontSize: 14, color: C.textSecondary, fontWeight: '600' },
  summaryValue: { fontSize: 28, color: C.text, fontWeight: '800', marginTop: 4 },
  card: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  amount: { fontSize: 18, color: C.primary, fontWeight: '700' },
  date: { fontSize: 13, color: C.textSecondary, marginTop: 4 },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, color: C.textSecondary },
});
