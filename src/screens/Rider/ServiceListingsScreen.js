import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import client from '../../api/client';

export default function ServiceListingsScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { category } = route.params || {};
  const COLORS = colors;
  const styles = createStyles(colors);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category === 'Rides' || category === 'Delivery') {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        let endpoint;
        if (category === 'Car Rental') endpoint = '/car-rental';
        else if (category === 'Food') endpoint = '/stores';
        else if (category === 'Services') endpoint = '/providers';
        else endpoint = null;

        if (!endpoint) {
          if (!cancelled) { setError('Unknown category'); setLoading(false); }
          return;
        }

        const response = await client.get(endpoint);
        const data = response.data?.data || [];
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) {
          setError('Failed to load listings: ' + (e.response?.data?.message || e.message));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const timer = setTimeout(() => {
      if (!cancelled && loading) {
        setLoading(false);
        if (!items.length && !error) setError('Request timed out. Please check your connection.');
      }
    }, 20000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading {category}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); setError(null); }} >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const headerEmoji = {
    Rides: '🚕',
    Delivery: '📦',
    'Car Rental': '🚗',
    Food: '🍔',
    Services: '🔧',
  }[category] || '🔎';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{headerEmoji} {category}</Text>

      {category === 'Rides' && (
        <View style={styles.ctaWrap}>
          <Text style={styles.ctaLabel}>Need a ride now?</Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('RideRequest')}
          >
            <Text style={styles.ctaText}>Request a Ride</Text>
          </TouchableOpacity>
        </View>
      )}

      {category === 'Delivery' && (
        <View style={styles.ctaWrap}>
          <Text style={styles.ctaLabel}>Order from your favorite stores</Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('Stores')}
          >
            <Text style={styles.ctaText}>Browse Stores</Text>
          </TouchableOpacity>
        </View>
      )}

      {category === 'Car Rental' && (
        items.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.errorEmoji}>🚗</Text>
            <Text style={styles.errorText}>No cars available right now.</Text>
          </View>
        ) : (
          items.map((car) => (
            <TouchableOpacity
              key={car.id}
              style={styles.card}
              onPress={() => navigation.navigate('CarDetail', { carId: car.id })}
            >
              <View style={styles.imgPlaceholder}>
                <Text style={styles.imgEmoji}>🚗</Text>
              </View>
              <Text style={styles.name}>{car.brand} {car.model}</Text>
              <Text style={styles.detail}>{car.seats} seats • {car.transmission} • {car.fuelType}</Text>
              <Text style={styles.price}>${(car.pricePerDay || 0).toFixed(2)}/day</Text>
            </TouchableOpacity>
          ))
        )
      )}

      {category === 'Food' && (
        items.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.errorEmoji}>🍽️</Text>
            <Text style={styles.errorText}>No stores found.</Text>
          </View>
        ) : (
          items.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={styles.card}
              onPress={() => navigation.navigate('StoreDetail', { store })}
            >
              {store.image ? (
                <Image source={{ uri: store.image }} style={styles.storeImage} />
              ) : (
                <View style={styles.imgPlaceholder}>
                  <Text style={styles.imgEmoji}>🍽️</Text>
                </View>
              )}
              <Text style={styles.name}>{store.name}</Text>
              <Text style={styles.detail}>{store.cuisine}</Text>
              {store.rating > 0 && (
                <Text style={styles.rating}>⭐ {(store.rating || 0).toFixed(1)}</Text>
              )}
            </TouchableOpacity>
          ))
        )
      )}

      {category === 'Services' && (
        items.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.errorEmoji}>🔧</Text>
            <Text style={styles.errorText}>No service providers found.</Text>
          </View>
        ) : (
          items.map((provider) => (
            <View key={provider.id} style={styles.card}>
              <Text style={styles.name}>{provider.businessName}</Text>
              <Text style={styles.detail}>{provider.category}</Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('ServiceRequest', { provider })}
              >
                <Text style={styles.actionText}>Request Service</Text>
              </TouchableOpacity>
            </View>
          ))
        )
      )}
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  center: { flex: 1, backgroundColor: C.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: C.textSecondary, marginTop: 12, fontSize: 14 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 16 },
  ctaWrap: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center' },
  ctaLabel: { color: C.textSecondary, fontSize: 14, marginBottom: 12 },
  ctaBtn: { backgroundColor: '#FFD700', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  ctaText: { color: '#000', fontWeight: '800', fontSize: 16 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  imgPlaceholder: { width: '100%', height: 140, backgroundColor: C.background, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  imgEmoji: { fontSize: 40 },
  storeImage: { width: '100%', height: 140, borderRadius: 12, marginBottom: 12 },
  name: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  detail: { color: C.textSecondary, fontSize: 13, marginBottom: 4 },
  price: { color: '#FFD700', fontWeight: '700', fontSize: 15 },
  rating: { color: C.warning, fontSize: 13, marginTop: 2 },
  actionBtn: { backgroundColor: '#FF3B30', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  actionText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { color: C.text, fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  retryBtn: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32, marginTop: 16 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
