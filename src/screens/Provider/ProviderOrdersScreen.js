import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import client from '../../api/client';

export default function ProviderOrdersScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const navigation = useNavigation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setError(null);
    try {
      const { data } = await client.get('/orders/my');
      setOrders(data?.data?.orders || data?.data || data?.orders || []);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load orders';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    if (s === 'COMPLETED') return '#4CAF50';
    if (s === 'IN_PROGRESS') return colors.primary;
    if (s === 'PENDING') return '#C0C0C0';
    if (s === 'CANCELLED') return colors.danger;
    return colors.textSecondary;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order #{item._id?.slice(-6) || item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.date}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
        </Text>
        <Text style={styles.total}>${item.total?.toFixed(2) || '0.00'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
            <Text style={styles.refreshText}>{refreshing ? '⟳ Refreshing...' : 'Refresh'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : error && orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchOrders}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={orders}
          keyExtractor={(item, index) => item._id || item.id || String(index)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No orders yet. Complete services to see them here.</Text>
            </View>
          }
          contentContainerStyle={orders.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const createStyles = (C) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12 },
    backBtn: { marginBottom: 8 },
    backText: { color: C.primary, fontSize: 16, fontWeight: '600' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: C.text },
    refreshText: { color: C.primary, fontSize: 14, fontWeight: '700' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    loadingText: { marginTop: 12, color: C.textSecondary, fontSize: 15, fontWeight: '600' },
    errorText: { color: '#FF0000', fontSize: 15, textAlign: 'center', marginBottom: 16 },
    retryBtn: { backgroundColor: C.primary, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
    retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    card: {
      backgroundColor: C.card,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      borderWidth: 1,
      borderColor: C.border,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    orderId: { fontSize: 16, fontWeight: '700', color: C.text, flex: 1 },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    date: { fontSize: 14, color: C.textSecondary },
    total: { fontSize: 16, fontWeight: '800', color: C.primary },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
  });
