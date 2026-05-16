import { useTheme } from '../../contexts/ThemeContext';

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import client from '../../api/client';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export default function DeliveryDropoffScreen({ route, navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get(`/food-orders`);
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
          mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 60, right: 40, bottom: 200, left: 40 }, animated: true });
        }
      }
    } catch (e) { console.error('Route error:', e); }
  };

  useEffect(() => {
    if (order?.deliveryLatitude && order?.deliveryLongitude && driverLocation) {
      fetchRoute(driverLocation.latitude, driverLocation.longitude, order.deliveryLatitude, order.deliveryLongitude);
    }
  }, [order, driverLocation]);

  const completeDelivery = async () => {
    setCompleting(true);
    try {
      await client.put(`/food-orders/${orderId}/status`, { status: 'DELIVERED' });
      Alert.alert('Delivery Complete!', 'Order has been delivered successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to complete delivery');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!order) return <View style={styles.center}><Text style={{ color: COLORS.text }}>Delivery not found</Text></View>;

  const dropLat = order.deliveryLatitude;
  const dropLng = order.deliveryLongitude;

  return (
    <View style={styles.container}>
      {dropLat && dropLng ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{ latitude: dropLat, longitude: dropLng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          showsUserLocation
        >
          <Marker coordinate={{ latitude: dropLat, longitude: dropLng }} title="Drop-off" pinColor="red" />
          {driverLocation && <Marker coordinate={driverLocation} title="You" pinColor={COLORS.primary} />}
          {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor={COLORS.primary} />}
        </MapView>
      ) : (
        <View style={styles.noMap}><Text style={styles.noMapText}>Delivery address unavailable</Text></View>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>📦 Deliver to Customer</Text>
        <Text style={styles.orderNumber}>Order #{order.id?.slice(0, 8)}</Text>

        {order.deliveryAddress && (
          <View style={styles.addressBox}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText} numberOfLines={2}>{order.deliveryAddress}</Text>
          </View>
        )}

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: '#5856D6' }]}>
            <Text style={styles.statusText}>{order.status?.replace(/_/g, ' ')}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={completeDelivery} disabled={completing}>
          {completing ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.btnText}>✓ Complete Delivery</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  noMap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  noMapText: { color: C.textSecondary, fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  card: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.card, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { color: C.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  orderNumber: { color: C.textSecondary, fontSize: 13, marginBottom: 12 },
  addressBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.background, borderRadius: 10, padding: 12, marginBottom: 12 },
  addressIcon: { fontSize: 18, marginRight: 8 },
  addressText: { flex: 1, color: C.text, fontSize: 14, fontWeight: '600' },
  statusRow: { flexDirection: 'row', marginBottom: 12 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  btn: { backgroundColor: '#34C759', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
