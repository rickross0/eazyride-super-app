import { useTheme } from '../../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import client from '../../api/client';

export default function RideReceiptScreen({ route, navigation }) {
  const { colors } = useTheme();
  const COLORS = colors;
  const styles = createStyles(colors);
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get(`/rides/${rideId}`);
        setRide(data?.data?.ride || data?.ride || null);
      } catch {}
    })();
  }, [rideId]);

  if (!ride) return <View style={styles.center}><Text style={{ color: COLORS.text }}>Loading...</Text></View>;

  const shareReceipt = async () => {
    try {
      await Share.share({
        message: `EazyRide Receipt\nRide: ${ride.id.slice(0, 8)}\nFare: $${(ride.fare || 0).toFixed(2)}\nDistance: ${(ride.distance || 0).toFixed(1)} km\nDate: ${new Date(ride.completedAt).toLocaleDateString()}`,
      });
    } catch {}
  };

  const fare = ride.fare || 0;
  const surgeMultiplier = ride.surgeMultiplier || 1;
  const baseFare = ride.baseFare || ride.fare || 0;
  const distanceCharge = ride.distanceCharge || 0;
  const timeCharge = ride.timeCharge || 0;
  const tip = ride.tip || 0;

  const hasBreakdown = ride.baseFare !== undefined || ride.distanceCharge !== undefined || ride.timeCharge !== undefined;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ride Receipt</Text>
      <View style={styles.receiptCard}>
        <Text style={styles.receiptId}>#{ride.id.slice(0, 8)}</Text>
        <Text style={styles.receiptDate}>{new Date(ride.completedAt).toLocaleDateString()} {new Date(ride.completedAt).toLocaleTimeString()}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>{ride.pickupLandmark || `${(ride.pickupLat || 0).toFixed(4)}, ${(ride.pickupLng || 0).toFixed(4)}`}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Dropoff</Text>
          <Text style={styles.value}>{ride.dropoffLandmark || `${(ride.dropoffLat || 0).toFixed(4)}, ${(ride.dropoffLng || 0).toFixed(4)}`}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>{(ride.distance || 0).toFixed(1)} km</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Vehicle Type</Text>
          <Text style={styles.value}>{ride.vehicleType || '—'}</Text>
        </View>
        {surgeMultiplier > 1 && (
          <View style={styles.row}>
            <Text style={styles.label}>Surge</Text>
            <Text style={[styles.value, { color: COLORS.warning }]}>{surgeMultiplier}x</Text>
          </View>
        )}

        <View style={styles.divider} />

        {hasBreakdown ? (
          <>
            {ride.baseFare !== undefined && (
              <View style={styles.row}>
                <Text style={styles.label}>Base Fare</Text>
                <Text style={styles.value}>${(ride.baseFare || 0).toFixed(2)}</Text>
              </View>
            )}
            {ride.distanceCharge !== undefined && (
              <View style={styles.row}>
                <Text style={styles.label}>Distance Charge</Text>
                <Text style={styles.value}>${(ride.distanceCharge || 0).toFixed(2)}</Text>
              </View>
            )}
            {ride.timeCharge !== undefined && (
              <View style={styles.row}>
                <Text style={styles.label}>Time Charge</Text>
                <Text style={styles.value}>${(ride.timeCharge || 0).toFixed(2)}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.row}>
            <Text style={styles.label}>Fare</Text>
            <Text style={styles.value}>${(fare || 0).toFixed(2)}</Text>
          </View>
        )}

        {tip > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Tip</Text>
            <Text style={styles.value}>${(tip || 0).toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Fare</Text>
          <Text style={styles.totalValue}>${(fare + tip || 0).toFixed(2)}</Text>
        </View>

        {ride.driver && (
          <View style={styles.driverRow}>
            <Text style={styles.driverLabel}>Driver</Text>
            <Text style={styles.driverValue}>{ride.driver.user?.firstName} {ride.driver.user?.lastName}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.shareBtn} onPress={shareReceipt}>
        <Text style={styles.shareBtnText}>Share Receipt</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 16 },
  receiptCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 20 },
  receiptId: { color: C.textSecondary, fontSize: 14, fontWeight: '600' },
  receiptDate: { color: C.textSecondary, fontSize: 13, marginBottom: 12 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: C.textSecondary, fontSize: 14 },
  value: { color: C.text, fontSize: 14, fontWeight: '500' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: C.text, fontSize: 18, fontWeight: '700' },
  totalValue: { color: C.primary, fontSize: 22, fontWeight: '800' },
  driverRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  driverLabel: { color: C.textSecondary, fontSize: 13 },
  driverValue: { color: C.text, fontSize: 13 },
  shareBtn: { backgroundColor: C.card, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: C.primary },
  shareBtnText: { color: C.primary, fontWeight: '700', fontSize: 16 },
  doneBtn: { backgroundColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
