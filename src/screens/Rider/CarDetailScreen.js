import { useTheme } from '../../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import client from '../../api/client';

export default function CarDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const COLORS = colors;
  const styles = createStyles(colors);
  const { carId } = route.params;
  const [car, setCar] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get(`/car-rental/${carId}`);
        setCar(data?.data?.car || data?.car || null);
      } catch (e) { console.error('Fetch car error:', e); }
    })();
  }, [carId]);

  if (!car) return <View style={styles.center}><Text style={{ color: '#AAA' }}>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{car.brand} {car.model}</Text>
      <Text style={styles.subtitle}>{car.year} • {car.color}</Text>

      <View style={styles.priceCard}>
        <Text style={styles.price}>${(car.pricePerDay || 0).toFixed(2)}<Text style={styles.perDay}>/day</Text></Text>
        {car.depositAmount > 0 && <Text style={styles.deposit}>Deposit: ${(car.depositAmount || 0).toFixed(2)}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Specifications</Text>
        <View style={styles.specGrid}>
          {[
            ['Seats', car.seats], ['Doors', car.doors], ['Transmission', car.transmission],
            ['Fuel', car.fuelType], ['Efficiency', car.fuelEfficiency ? `${car.fuelEfficiency} km/L` : '—'],
            ['Luggage', car.luggageCapacity ? `${car.luggageCapacity}L` : '—'],
          ].map(([label, val]) => (
            <View key={label} style={styles.specItem}>
              <Text style={styles.specLabel}>{label}</Text>
              <Text style={styles.specValue}>{val || '—'}</Text>
            </View>
          ))}
        </View>
      </View>

      {car.features && car.features.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.features}>
            {car.features.map((f, i) => (
              <View key={i} style={styles.featureTag}><Text style={styles.featureText}>{f}</Text></View>
            ))}
          </View>
        </View>
      )}

      {car.description && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>{car.description}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('CarBooking', { carId: car.id, pricePerDay: car.pricePerDay, depositAmount: car.depositAmount || 0 })}>
        <Text style={styles.bookText}>Book This Car</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#AAA', marginBottom: 20 },
  priceCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 24, marginBottom: 16 },
  price: { fontSize: 36, fontWeight: '800', color: '#FFD700' },
  perDay: { fontSize: 14, fontWeight: '400', color: '#AAA' },
  deposit: { color: '#FF9500', fontSize: 14, fontWeight: '600', marginTop: 4 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 14 },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specItem: { width: '48%', backgroundColor: '#0F0F0F', borderRadius: 10, padding: 12, marginBottom: 4 },
  specLabel: { color: '#AAA', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 },
  specValue: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureTag: { backgroundColor: '#0F0F0F', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  featureText: { color: '#AAA', fontSize: 13 },
  desc: { color: '#AAA', fontSize: 14, lineHeight: 22 },
  bookBtn: { backgroundColor: '#FFD700', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 40 },
  bookText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
});
