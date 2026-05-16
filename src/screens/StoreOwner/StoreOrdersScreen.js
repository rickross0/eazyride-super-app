import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';

export default function StoreOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/store');
      setOrders(data?.orders || data || []);
    } catch {}
  };

  useEffect(() => { fetchOrders(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.orderId}>Order #{item._id?.slice(-6) || item.id}</Text>
        <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status}</Text>
      </View>
      <Text style={styles.items}>{item.items?.length || 0} items · ${item.total?.toFixed(2) || '0.00'}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#888';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Store Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item._id || item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        }
        contentContainerStyle={orders.length === 0 ? { flex: 1 } : {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, paddingTop: 50, color: '#333' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 15, fontWeight: '600', color: '#333' },
  status: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  items: { fontSize: 14, color: '#555', marginTop: 4 },
  date: { fontSize: 12, color: '#888', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#888' },
});
