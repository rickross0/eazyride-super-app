import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from '../../components/MapPlaceholder';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import client from '../../api/client';

export default function RideRequestScreen({ navigation }) {
  const { colors } = useTheme();
  const [pickup, setPickup] = useState(null);
  const [vehicleType, setVehicleType] = useState('BAJAJ');
  const [requesting, setRequesting] = useState(false);
  const [locating, setLocating] = useState(true);
  const styles = createStyles(colors);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Location Required', 'Enable location to request rides');
          setLocating(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setPickup({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, name: 'Current Location' });
      } catch {
        Alert.alert('Location Error', 'Could not get your location');
      } finally {
        setLocating(false);
      }
    })();
  }, []);

  const requestRide = async () => {
    if (!pickup) return Alert.alert('Error', 'Enable location to request a ride');
    setRequesting(true);
    try {
      const payload = {
        pickupLat: pickup.latitude,
        pickupLng: pickup.longitude,
        vehicleType,
      };
      const { data } = await client.post('/rides', payload);
      navigation.navigate('RideTracking', { rideId: data.ride.id });
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to request ride');
    } finally {
      setRequesting(false);
    }
  };

  const initialRegion = pickup
    ? { ...pickup, latitudeDelta: 0.015, longitudeDelta: 0.012 }
    : { latitude: 8.4737, longitude: 47.1208, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={styles.container}>
      {locating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation={true}>
        {pickup && (
          <Marker coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }} title="Pickup" />
        )}
      </MapView>

      <View style={styles.bottomCard}>
        <Text style={styles.cardTitle}>Request a Ride</Text>
        {pickup && (
          <View style={styles.pickupRow}>
            <Text style={styles.pickupIcon}>📍</Text>
            <Text style={styles.pickupText} numberOfLines={1}>{pickup.name}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Vehicle type</Text>
        <View style={styles.vehicleRow}>
          {['BAJAJ', 'CAR'].map((v) => (
            <TouchableOpacity key={v} style={[styles.vehicleBtn, vehicleType === v && styles.vehicleActive]} onPress={() => setVehicleType(v)}>
              <Text style={[styles.vehicleText, vehicleType === v && styles.vehicleTextActive]}>
                {v === 'BAJAJ' ? '🛺 Bajaj' : '🚗 Car'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.requestBtn, requesting && styles.requestBtnDisabled]}
          onPress={requestRide}
          disabled={requesting}
        >
          {requesting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.requestBtnText}>Request Ride</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingOverlay: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -60 }, { translateY: -20 }], zIndex: 10, backgroundColor: C.card, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6 },
  loadingText: { color: C.text, fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
  bottomCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.card, padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 12, letterSpacing: 0.3 },
  pickupRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.background, borderRadius: 12, padding: 14, marginBottom: 16 },
  pickupIcon: { fontSize: 18, marginRight: 10 },
  pickupText: { flex: 1, color: C.text, fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 0.3 },
  vehicleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  vehicleBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: C.background, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  vehicleActive: { backgroundColor: C.primary, borderColor: C.primary },
  vehicleText: { color: C.textSecondary, fontWeight: '700', fontSize: 16, textAlign: 'center', letterSpacing: 0.2 },
  vehicleTextActive: { color: '#FFF' },
  requestBtn: { backgroundColor: C.primary, borderRadius: 14, padding: 18, alignItems: 'center', elevation: 2 },
  requestBtnDisabled: { opacity: 0.7 },
  requestBtnText: { color: '#FFF', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
});
