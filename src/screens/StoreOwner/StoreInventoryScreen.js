import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/client';

export default function StoreInventoryScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/products/my');
      setItems(data?.products || data?.data || []);
    } catch {}
  };

  useEffect(() => { fetchItems(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>${item.price?.toFixed(2) || '0.00'}</Text>
            <Text style={styles.stock}>Stock: {item.stock || 0}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No products yet</Text>
          </View>
        }
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
      />
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, paddingTop: 50, color: C.text },
  card: { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, elevation: 2 },
  name: { fontSize: 16, fontWeight: '700', color: C.text },
  price: { fontSize: 14, color: C.primary, fontWeight: '600', marginTop: 4 },
  stock: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: C.textSecondary },
});
