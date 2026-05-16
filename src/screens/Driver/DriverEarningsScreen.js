import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';

export default function DriverEarningsScreen() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, total: 0 });

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await api.get('/drivers/earnings');
        const result = data?.data || data || { today: 0, week: 0, month: 0, total: 0 };
        setEarnings(result);
      } catch {}
    };
    fetchEarnings();
  }, []);

  const cards = [
    { label: 'Today', value: earnings.today, color: '#4CAF50' },
    { label: 'This Week', value: earnings.week, color: '#2196F3' },
    { label: 'This Month', value: earnings.month, color: '#FF9800' },
    { label: 'All Time', value: earnings.total, color: '#9C27B0' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Earnings</Text>
      <View style={styles.grid}>
        {cards.map(c => (
          <View key={c.label} style={[styles.card, { borderLeftColor: c.color }]}>
            <Text style={styles.cardLabel}>{c.label}</Text>
            <Text style={[styles.cardValue, { color: c.color }]}>
              ${typeof c.value === 'number' ? c.value.toFixed(2) : '0.00'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, paddingTop: 50, color: '#333' },
  grid: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, borderLeftWidth: 4, elevation: 2 },
  cardLabel: { fontSize: 14, color: '#888', marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: 'bold' },
});
