import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_CONFIG } from '../../config';
import api from '../../api/client';

export default function StoreOwnerHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, rating: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const cfg = ROLE_CONFIG.STORE_OWNER;

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/orders/store');
      const orders = data?.orders || data?.data?.orders || [];
      const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      setStats({ orders: orders.length, revenue, products: 0, rating: 0 });
    } catch {}
  };

  useEffect(() => { fetchStats(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const actions = [
    { icon: '📦', label: 'Inventory', screen: 'Inventory' },
    { icon: '🛒', label: 'Orders', screen: 'Orders' },
    { icon: '⭐', label: 'Reviews', screen: 'Home' },
    { icon: '💰', label: 'Earnings', screen: 'Home' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cfg.color }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {user?.firstName || 'Store Owner'} 🏪</Text>
      </View>

      <View style={styles.statsGrid}>
        {[
          { label: 'Orders', value: stats.orders, icon: '🛒' },
          { label: 'Revenue', value: `$${(stats.revenue || 0).toFixed(2)}`, icon: '💰' },
          { label: 'Products', value: stats.products, icon: '📦' },
          { label: 'Rating', value: (stats.rating || 0).toFixed(1), icon: '⭐' },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {actions.map(action => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center', elevation: 2 },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, alignItems: 'center', elevation: 2 },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
});
