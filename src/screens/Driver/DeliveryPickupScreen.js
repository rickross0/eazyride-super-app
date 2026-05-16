import { useTheme } from '../../contexts/ThemeContext';

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import client from '../../api/client';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export default function DeliveryPickupScreen({ route, navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [nfcScanning, setNfcScanning] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    NfcManager.start().catch(() => {});
    return () => { NfcManager.cancelTechnologyRequest().catch(() => {}); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/drivers/orders');
        const found = (data.orders || []).find((o) => o.id === orderId);
        if (found) setOrder(found);
      } catch (e) {
        console.error('Failed to load delivery:', e);
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (loc) => setDriverLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
      );
    })();
  }, [orderId]);

  const fetchRoute = async (originLat, originLng, destLat, destLng) => {
    try {
      const { data } = await axios.get(`${OSRM_URL}/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`);
      if (data.routes?.length) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords);
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 60, right: 40, bottom: 280, left: 40 }, animated: true });
        }
      }
    } catch (e) { console.error('Route error:', e); }
  };

  useEffect(() => {
    if (order?.restaurant && driverLocation) {
      fetchRoute(driverLocation.latitude, driverLocation.longitude, order.restaurant.latitude, order.restaurant.longitude);
    }
  }, [order, driverLocation]);

  const verifyArrival = async () => {
    setVerifying(true);
    try {
      const { data } = await client.put(`/food-orders/${orderId}/verify-arrival`, {});
      if (data.status === 'DRIVER_ARRIVED') {
        setArrived(true);
        setShowPin(true);
        Alert.alert('Arrival Verified', 'You are at the restaurant. Show your pickup PIN or tap NFC to confirm.');
      } else {
        Alert.alert('Not Close Enough', `GPS says you are ${data.distanceMeters}m away. Move closer or use NFC.`);
      }
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to verify arrival';
      if (msg.includes('distance') || msg.includes('close') || msg.includes('Not Close')) {
        Alert.alert(
          'Not Close Enough',
          'You are too far from the restaurant. Use NFC to verify pickup.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Verify with NFC', onPress: () => verifyNfcPickup() },
          ]
        );
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setVerifying(false);
    }
  };

  const verifyNfcPickup = async () => {
    setNfcScanning(true);
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      if (!tag) {
        Alert.alert('NFC Error', 'No NFC tag detected. Try again.');
        return;
      }
      const tagId = tag.id;
      console.log('[NFC] Tag detected:', tagId);

      const { data } = await client.put(`/food-orders/${orderId}/verify-arrival`, {
        nfcVerified: true,
        nfcTagId: tagId,
      });

      if (data.status === 'DRIVER_ARRIVED') {
        setArrived(true);
        setShowPin(true);
        Alert.alert('NFC Pickup Confirmed', 'Restaurant verified via NFC tap.');
      } else {
        Alert.alert('Verification Failed', data.error || 'Could not verify NFC pickup.');
      }
    } catch (e) {
      console.error('[NFC] Error:', e);
      Alert.alert('NFC Error', e.message || 'Failed to read NFC tag.');
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setNfcScanning(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!order) return <View style={styles.center}><Text style={{ color: COLORS.text }}>Delivery not found</Text></View>;

  const restaurantLat = order.restaurant?.latitude;
  const restaurantLng = order.restaurant?.longitude;
  const qrData = order.pickupPin ? `eazyride://pickup-verify?orderId=${orderId}&pin=${order.pickupPin}` : '';

  return (
    <View style={styles.container}>
      {restaurantLat && restaurantLng ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{ latitude: restaurantLat, longitude: restaurantLng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          showsUserLocation
        >
          <Marker coordinate={{ latitude: restaurantLat, longitude: restaurantLng }} title={order.restaurant?.name || 'Restaurant'} pinColor="red" />
          {driverLocation && <Marker coordinate={driverLocation} title="You" pinColor={COLORS.primary} />}
          {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor={COLORS.primary} />}
        </MapView>
      ) : (
        <View style={styles.noMap}><Text style={styles.noMapText}>Restaurant location unavailable</Text></View>
      )}

      <ScrollView style={styles.cardScroll}>
        <View style={styles.card}>
          <Text style={styles.title}>🍔 Pickup from {order.restaurant?.name || 'Restaurant'}</Text>
          <Text style={styles.orderNumber}>Order #{order.id?.slice(0, 8)}</Text>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.statusText}>{order.status?.replace(/_/g, ' ')}</Text>
            </View>
          </View>

          {order.items && order.items.length > 0 && (
            <View style={styles.itemsSection}>
              <Text style={styles.itemsTitle}>Items to collect:</Text>
              {order.items.map((item, i) => (
                <Text key={i} style={styles.itemText}>• {item.quantity}x {item.name}</Text>
              ))}
            </View>
          )}

          {!arrived && (
            <View style={{ marginTop: 8 }}>
              <TouchableOpacity style={styles.btn} onPress={verifyArrival} disabled={verifying}>
                <Text style={styles.btnText}>{verifying ? 'Verifying GPS...' : '📍 Verify Arrival (GPS)'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFD700', marginTop: 10 }]} onPress={verifyNfcPickup} disabled={nfcScanning}>
                <Text style={[styles.btnText, { color: '#000' }]>{nfcScanning ? 'Hold phone near NFC tag...' : '📱 Verify Pickup (NFC)'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {showPin && (
            <View style={styles.verificationSection}>
              <Text style={styles.verifyTitle}>🔐 Pickup Verification</Text>
              <Text style={styles.verifySubtitle}>Show one of these to the store owner:</Text>

              {/* Method 1: PIN */}
              <View style={styles.pinBox}>
                <Text style={styles.pinLabel}>4-Digit PIN</Text>
                <Text style={styles.pinValue}>{order.pickupPin}</Text>
                <Text style={styles.pinHint}>Read this number aloud to the store owner</Text>
              </View>

              {/* Method 2: QR Code */}
              {qrData ? (
                <View style={styles.qrBox}>
                  <Text style={styles.qrLabel}>QR Code</Text>
                  <Text style={styles.qrHint}>Let the store owner scan this with their app</Text>
                  <View style={styles.qrPlaceholder}>
                    <Text style={styles.qrData}>{qrData}</Text>
                  </View>
                  <Text style={styles.qrAlt}>Or share: <Text style={styles.qrDataSmall}>{order.pickupPin}</Text></Text>
                </View>
              ) : null}

              {/* Method 3: NFC */}
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFD700' }]} onPress={verifyNfcPickup} disabled={nfcScanning}>
                <Text style={[styles.btnText, { color: '#000' }]>{nfcScanning ? 'Scanning NFC...' : '📱 Tap NFC Tag to Transfer'}</Text>
              </TouchableOpacity>

              {/* Confirm Pickup button */}
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  Alert.alert(
                    'Confirm Pickup',
                    'Has the store owner verified your PIN, QR code, or NFC tap?',
                    [
                      { text: 'No', style: 'cancel' },
                      { text: 'Yes, Confirmed', onPress: async () => {
                        try {
                          await client.put(`/food-orders/${orderId}/status`, { status: 'PICKUP_CONFIRMED' });
                          Alert.alert('Pickup Confirmed', 'Head to the customer now!', [
                            { text: 'Go to Dropoff', onPress: () => navigation.replace('DeliveryDropoff', { orderId }) },
                          ]);
                        } catch (e) {
                          Alert.alert('Error', e.response?.data?.error || 'Failed to confirm pickup');
                        }
                      }},
                    ]
                  );
                }}
              >
                <Text style={styles.confirmBtnText}>✓ Confirm Pickup Verified</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  noMap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  noMapText: { color: C.textSecondary, fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  cardScroll: { flex: 1 },
  card: { backgroundColor: C.card, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { color: C.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  orderNumber: { color: C.textSecondary, fontSize: 13, marginBottom: 12 },
  statusRow: { flexDirection: 'row', marginBottom: 12 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  itemsSection: { backgroundColor: C.background, borderRadius: 10, padding: 12, marginBottom: 12 },
  itemsTitle: { color: C.text, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  itemText: { color: C.textSecondary, fontSize: 13, marginBottom: 2 },
  verificationSection: { marginTop: 8 },
  verifyTitle: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  verifySubtitle: { color: C.textSecondary, fontSize: 13, marginBottom: 16 },
  pinBox: { backgroundColor: C.background, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: C.primary },
  pinLabel: { color: C.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5 },
  pinValue: { color: C.primary, fontSize: 40, fontWeight: '900', letterSpacing: 10, marginVertical: 4 },
  pinHint: { color: C.textSecondary, fontSize: 12, textAlign: 'center' },
  qrBox: { backgroundColor: C.background, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  qrLabel: { color: C.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  qrHint: { color: C.textSecondary, fontSize: 12, marginBottom: 12 },
  qrPlaceholder: { width: 180, height: 180, backgroundColor: '#FFFFFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', padding: 8 },
  qrData: { color: '#1A1A1A', fontSize: 9, fontWeight: '600', textAlign: 'center' },
  qrDataSmall: { color: C.primary, fontWeight: '600' },
  qrAlt: { color: C.textSecondary, fontSize: 12, marginTop: 8, textAlign: 'center' },
  confirmBtn: { backgroundColor: '#34C759', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  btn: { backgroundColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
