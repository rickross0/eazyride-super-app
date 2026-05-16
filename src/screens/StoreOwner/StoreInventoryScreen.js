import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../../api/client';

export default function StoreInventoryScreen() {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/stores/my-products');
      setProducts(data?.products || data || []);
    } catch {}
  };

  useEffect(() => { fetchProducts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.badge, item.available ? styles.available : styles.out]}>
          {item.available ? 'In Stock' : 'Out'}
        </Text>
      </View>
      <Text style={styles.price}>${item.price?.toFixed(2)}</Text>
      <Text style={styles.qty}>Qty: {item.quantity || 0}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>
      <FlatList
        data={products}
        keyExtractor={item => item._id || item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No products yet</Text>
          </View>
        }
        contentContainerStyle={products.length === 0 ? { flex: 1 } : {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, paddingTop: 50, color: '#333' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  badge: { fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  available: { backgroundColor: '#E8F5E9', color: '#4CAF50' },
  out: { backgroundColor: '#FFEBEE', color: '#F44336' },
  price: { fontSize: 14, fontWeight: 'bold', color: '#FF9800', marginTop: 4 },
  qty: { fontSize: 12, color: '#888', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#888' },
});
