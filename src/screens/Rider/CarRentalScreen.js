import { useTheme } from '../../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import client from '../../api/client';

export default function CarRentalScreen({ navigation }) {
  const { colors } = useTheme();
  const COLORS = colors;
  const styles = createStyles(colors);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      console.log('[CarRental] Fetching cars...');
      try {
        const response = await client.get('/car-rental');
        console.log('[CarRental] Response:', JSON.stringify(response.data).slice(0, 200));
        const items = response.data?.data || [];
        console.log('[CarRental] Items count:', items.length);
        if (mounted) setCars(items);
      } catch (e) {
        console.error('[CarRental] Error:', e.message, e.response?.status, e.response?.data);
        if (mounted) setError('Failed to load available cars: ' + (e.response?.data?.message || e.message));
      } finally {
        if (mounted) { console.log('[CarRental] Setting loading false'); setLoading(false); }
      }
    })();
    const timer = setTimeout(() => {
      console.log('[CarRental] Safety timeout triggered');
      if (mounted) setLoading(false);
      if (mounted && !cars.length && !error) setError('Request timed out. Please check your connection.');
    }, 20000);
    return () => { mounted = false; clearTimeout(timer); };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading available cars...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>🚙</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); setError(null); }}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🚙 Rent a Car</Text>
      {cars.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>🚙</Text>
          <Text style={styles.errorText}>No cars available at the moment.</Text>
          <Text style={styles.errorHint}>Check back later for new listings.</Text>
        </View>
      ) : (
        cars.map((car) => (
          <TouchableOpacity key={car.id} style={styles.card} onPress={() => navigation.navigate('CarBooking', { carId: car.id, pricePerDay: car.pricePerDay, depositAmount: car.depositAmount || 0 })}>
            <Text style={styles.carName}>{car.brand} {car.model} ({car.year})</Text>
            <Text style={styles.carDetail}>{car.seats} seats • {car.transmission} • {car.fuelType}</Text>
            <Text style={styles.carPrice}>${(car.pricePerDay || 0).toFixed(2)}/day • Deposit: ${(car.depositAmount || 0).toFixed(2)}</Text>
            <Text style={styles.carRating}>⭐ {(car.rating || 0).toFixed(1)}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  center: { flex: 1, backgroundColor: C.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: C.textSecondary, marginTop: 12, fontSize: 14 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 16 },
  card: { backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  carName: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  carDetail: { color: C.textSecondary, fontSize: 13, marginBottom: 4 },
  carPrice: { color: C.primary, fontWeight: '600', marginBottom: 2 },
  carRating: { color: C.textSecondary, fontSize: 12 },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { color: C.text, fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  errorHint: { color: C.textSecondary, fontSize: 13, textAlign: 'center' },
  retryBtn: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32, marginTop: 16 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
