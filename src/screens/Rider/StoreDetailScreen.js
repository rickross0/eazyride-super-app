import { useTheme } from '../../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import client from '../../api/client';

export default function StoreDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const COLORS = colors;
  const styles = createStyles(colors);
  const { store } = route.params;
  const [menuItems, setMenuItems] = useState([]);
  const { addItem, itemCount, total } = useCart();

  useEffect(() => {
    (async () => {
      try { const { data } = await client.get(`/stores/${store.id}/menu`); setMenuItems(data.data || []); } catch {}
    })();
  }, [store.id]);

  return (
    <View style={styles.container}>
      <ScrollView>
        {store.image ? (
          <Image source={{ uri: store.image }} style={styles.storeImage} />
        ) : null}
        <Text style={styles.title}>{store.name}</Text>
        <Text style={styles.category}>{store.cuisine}</Text>

        <Text style={styles.sectionTitle}>Menu</Text>
        {menuItems.map((item) => (
          <View key={item.id} style={styles.menuCard}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.menuImage} />
            ) : null}
            <View style={styles.menuInfo}>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.menuPrice}>${(item.price || 0).toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item, store)}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {itemCount > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartText}>🛒 {itemCount} items • ${total.toFixed(2)}</Text>
          <Text style={styles.cartAction}>View Cart →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  storeImage: { width: '100%', height: 200 },
  title: { fontSize: 24, fontWeight: '800', color: C.text, padding: 20, marginBottom: 0 },
  category: { color: C.textSecondary, fontSize: 14, paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 12 },
  menuCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 20, marginBottom: 10, borderRadius: 12, padding: 14, overflow: 'hidden' },
  menuImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  menuInfo: { flex: 1 },
  menuName: { color: C.text, fontWeight: '600', fontSize: 16, marginBottom: 2 },
  menuDesc: { color: C.textSecondary, fontSize: 12, marginBottom: 4 },
  menuPrice: { color: C.primary, fontWeight: '700' },
  addBtn: { backgroundColor: C.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  cartBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.primary, padding: 16, alignItems: 'center' },
  cartText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  cartAction: { color: '#FFF', fontWeight: '700' },
});
