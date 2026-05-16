import { useTheme } from '../../contexts/ThemeContext';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import client from '../../api/client';

export default function CarBookingScreen({ route, navigation }) {
  const { colors } = useTheme();
  const COLORS = colors;
  const styles = createStyles(colors);
  const { carId, pricePerDay, depositAmount } = route.params;
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 86400000));
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const days = Math.max(1, Math.ceil((endDate - startDate) / 86400000));
  const baseCost = days * pricePerDay;
  const totalCost = baseCost + depositAmount;

  const confirmBooking = async () => {
    if (!pickupLocation.trim()) return Alert.alert('Missing Info', 'Enter a pickup location');
    setLoading(true);
    try {
      await client.post('/car-rental/bookings', {
        carId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pickupLocation,
      });
      Alert.alert('Booked!', 'Your reservation has been created.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Booking Failed', e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Your Car</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pickup Date</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStart(true)}>
          <Text style={styles.dateText}>{startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Return Date</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEnd(true)}>
          <Text style={styles.dateText}>{endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        </TouchableOpacity>

        <Text style={styles.daysLabel}>{days} day{days > 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pickup Location</Text>
        <TextInput style={styles.input} placeholder="Enter pickup address" placeholderTextColor={COLORS.textSecondary} value={pickupLocation} onChangeText={setPickupLocation} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cost Breakdown</Text>
        <View style={styles.row}><Text style={styles.rowLabel}>Daily rate</Text><Text style={styles.rowValue}>${(pricePerDay || 0).toFixed(2)} x {days}</Text></View>
        <View style={styles.row}><Text style={styles.rowLabel}>Base cost</Text><Text style={styles.rowValue}>${baseCost.toFixed(2)}</Text></View>
        {depositAmount > 0 && <View style={styles.row}><Text style={styles.rowLabel}>Security deposit</Text><Text style={styles.rowValue}>${depositAmount.toFixed(2)}</Text></View>}
        <View style={[styles.row, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>${totalCost.toFixed(2)}</Text></View>
      </View>

      <TouchableOpacity style={styles.confirmBtn} onPress={confirmBooking} disabled={loading}>
        <Text style={styles.confirmText}>{loading ? 'Booking...' : 'Confirm Booking'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 20 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 10 },
  dateBtn: { backgroundColor: C.background, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.border },
  dateText: { color: C.text, fontSize: 15 },
  daysLabel: { color: C.primary, fontWeight: '700', fontSize: 14, marginTop: 8, textAlign: 'right' },
  input: { backgroundColor: C.background, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, fontSize: 15, color: C.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { color: C.textSecondary, fontSize: 14 },
  rowValue: { color: C.text, fontSize: 14, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, marginTop: 4 },
  totalLabel: { color: C.text, fontSize: 16, fontWeight: '700' },
  totalValue: { color: C.primary, fontSize: 20, fontWeight: '800' },
  confirmBtn: { backgroundColor: C.primary, borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 40 },
  confirmText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
});
