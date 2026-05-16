import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/client';

export default function DriverOrdersScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/drivers/orders');
      setOrders(data?.data || data || []);
    } catch {}
  };

  useEffect(() => { fetchOrders(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DeliveryPickup', { orderId: item.id, order: item })}
          >
            <Text style={styles.orderId}>Order #{item.id?.slice(-6) || item.id}</Text>
            <Text style={styles.status}>{item.status?.replace(/_/g, ' ')}</Text>
            <Text style={styles.fare}>${(item.fare || item.total || 0).toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders assigned yet</Text>
          </View>
        }
        contentContainerStyle={orders.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
      />
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, paddingTop: 50, color: C.text },
  card: { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, elevation: 2 },
  orderId: { fontSize: 15, fontWeight: '600', color: C.text },
  status: { fontSize: 13, color: C.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  fare: { fontSize: 14, color: C.primary, fontWeight: '700', marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: C.textSecondary },
});
