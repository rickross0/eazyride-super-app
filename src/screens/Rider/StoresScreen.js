import { useTheme } from '../../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import client from '../../api/client';

const CATEGORIES = ['All', 'Somali', 'Fast Food', 'Pizza', 'Burgers', 'Juice', 'Coffee'];

export default function StoresScreen({ navigation }) {
  const { colors } = useTheme();
  const COLORS = colors;
  const styles = createStyles(colors);
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      console.log('[Stores] Fetching stores...');
      try {
        const response = await client.get('/stores');
        console.log('[Stores] Response:', JSON.stringify(response.data).slice(0, 200));
        const items = response.data?.data || [];
        console.log('[Stores] Items count:', items.length);
        setStores(items);
        setFiltered(items);
      } catch (e) {
        console.error('[Stores] Error:', e.message, e.response?.status, e.response?.data);
        setError('Failed to load restaurants: ' + (e.response?.data?.message || e.message));
      } finally {
        console.log('[Stores] Setting loading false');
        setLoading(false);
      }
    })();
    const timer = setTimeout(() => {
      console.log('[Stores] Safety timeout triggered');
      setLoading(false);
      if (!stores.length && !error) setError('Request timed out. Please check your connection.');
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = stores;
    if (activeCategory !== 'All') {
      result = result.filter((s) => s.cuisine?.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name?.toLowerCase().includes(q) || s.cuisine?.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [search, activeCategory, stores]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>🍔</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); setError(null); }}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Haye! Food</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search restaurants..."
        placeholderTextColor={COLORS.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>🍽️</Text>
          <Text style={styles.errorText}>No restaurants found</Text>
          <Text style={styles.errorHint}>Try a different search or category.</Text>
        </View>
      )}

      {filtered.map((store) => (
        <TouchableOpacity key={store.id} style={styles.storeCard} onPress={() => navigation.navigate('StoreDetail', { store })}>
          {store.image ? (
            <Image source={{ uri: store.image }} style={styles.storeImage} />
          ) : (
            <View style={styles.storeImgPlaceholder}><Text style={styles.storeEmoji}>🍽️</Text></View>
          )}
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeCuisine}>{store.cuisine}</Text>
            <View style={styles.storeMeta}>
              {store.rating > 0 && <Text style={styles.storeRating}>⭐ {(store.rating || 0).toFixed(1)}</Text>}
              {store.deliveryFee > 0 && <Text style={styles.storeFee}>Delivery: ${(store.deliveryFee || 0).toFixed(2)}</Text>}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  center: { flex: 1, backgroundColor: C.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: C.textSecondary, marginTop: 12, fontSize: 14 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 12 },
  searchInput: { backgroundColor: C.card, borderRadius: 12, padding: 14, color: C.text, fontSize: 16, marginBottom: 12 },
  catRow: { marginBottom: 16 },
  catChip: { backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  catChipActive: { backgroundColor: C.primary },
  catText: { color: C.textSecondary, fontWeight: '600', fontSize: 13 },
  catTextActive: { color: '#FFF' },
  empty: { color: C.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 16 },
  storeCard: { backgroundColor: C.card, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  storeImage: { width: '100%', height: 160 },
  storeImgPlaceholder: { width: '100%', height: 56, backgroundColor: C.background, justifyContent: 'center', alignItems: 'center' },
  storeEmoji: { fontSize: 24 },
  storeInfo: { padding: 16 },
  storeName: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  storeCuisine: { color: C.textSecondary, fontSize: 13, marginBottom: 4 },
  storeMeta: { flexDirection: 'row', gap: 12 },
  storeRating: { color: C.warning, fontSize: 12 },
  storeFee: { color: C.textSecondary, fontSize: 12 },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { color: C.text, fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  errorHint: { color: C.textSecondary, fontSize: 13, textAlign: 'center' },
  retryBtn: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32, marginTop: 16 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
