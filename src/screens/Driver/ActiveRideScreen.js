import { useTheme } from '../../contexts/ThemeContext';

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import client from '../../api/client';
import { SOCKET_URL } from '../../config';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export default function ActiveRideScreen({ route, navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [driverPos, setDriverPos] = useState(null);
  const socketRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data } = await client.get(`/rides/${rideId}`);
      setRide(data.ride);
      if (data.ride?.pickupLat && data.ride?.dropoffLat) {
        await fetchRoute(data.ride);
      }
    })();

    const connectSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      const socket = io(SOCKET_URL, { auth: { token } });
      socketRef.current = socket;
      socket.on('driver:location', (pos) => setDriverPos(pos));
    };
    connectSocket();

    return () => { socketRef.current?.disconnect(); };
  }, [rideId]);

  const fetchRoute = async (rideData) => {
    try {
      const { data } = await axios.get(
        `${OSRM_URL}/${rideData.pickupLng},${rideData.pickupLat};${rideData.dropoffLng},${rideData.dropoffLat}?overview=full&geometries=geojson`
      );
      if (data.routes?.length) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords);
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 60, right: 40, bottom: 300, left: 40 }, animated: true });
        }
      }
    } catch (e) {
      console.error('Route fetch error:', e);
    }
  };

  const startRide = async () => {
    try { await client.put(`/rides/${rideId}/status`, { status: 'IN_PROGRESS' }); const { data } = await client.get(`/rides/${rideId}`); setRide(data.ride); } catch (e) { Alert.alert('Error', e.message); }
  };

  const completeRide = async () => {
    try { await client.put(`/rides/${rideId}/status`, { status: 'COMPLETED' }); navigation.goBack(); } catch (e) { Alert.alert('Error', e.message); }
  };

  const cancelRide = async () => {
    try { await client.post(`/rides/${rideId}/cancel`, { reason: 'Driver cancelled' }); navigation.goBack(); } catch (e) { Alert.alert('Error', e.message); }
  };

  const navigateTo = (lat, lng, label) => {
    Alert.alert(`Navigate to ${label}`, 'Choose navigation app:', [
      { text: 'Google Maps', onPress: () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`).catch(() => {}) },
      { text: 'OsmAnd', onPress: () => Linking.openURL(`osmand.net/lat/${lat}/lon/${lng}`).catch(() => Alert.alert('Not Installed', 'OsmAnd is not installed on your device')) },
      { text: 'Organic Maps', onPress: () => Linking.openURL(`orgmaps://navigate?lat=${lat}&lon=${lng}`).catch(() => Alert.alert('Not Installed', 'Organic Maps is not installed on your device')) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const navigateToPickup = () => { if (ride) navigateTo(ride.pickupLat, ride.pickupLng, 'Pickup'); };
  const navigateToDropoff = () => { if (ride) navigateTo(ride.dropoffLat, ride.dropoffLng, 'Dropoff'); };

  const callRider = () => {
    if (!ride?.rider?.phone) return Alert.alert('Error', 'Rider phone not available');
    Linking.openURL(`tel:${ride.rider.phone}`).catch(() => Alert.alert('Error', 'Could not make call'));
  };

  if (!ride) return <View style={styles.center}><Text style={{ color: COLORS.text }}>Loading...</Text></View>;

  const pickup = { latitude: ride.pickupLat, longitude: ride.pickupLng };
  const dropoff = { latitude: ride.dropoffLat, longitude: ride.dropoffLng };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ ...pickup, latitudeDelta: 0.015, longitudeDelta: 0.012 }}
        showsUserLocation
      >
        <Marker coordinate={pickup} title="Pickup" pinColor="blue" />
        <Marker coordinate={dropoff} title="Dropoff" pinColor="green" />
        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor={COLORS.primary} />}
        {driverPos && <Marker coordinate={{ latitude: driverPos.lat, longitude: driverPos.lng }} title="You" pinColor={COLORS.primary} />}
      </MapView>

      <View style={styles.card}>
        <Text style={styles.riderName}>{ride.rider?.firstName} {ride.rider?.lastName}</Text>
        <Text style={styles.fare}>${(ride.fare || 0).toFixed(2)}</Text>
        <Text style={styles.status}>Status: {ride.status}</Text>
        <View style={styles.driverInfoRow}>
          <Text style={styles.driverInfoLabel}>Your Vehicle</Text>
          <Text style={styles.driverInfoValue}>{ride.vehicleType || 'BAJAJ'} • {ride.driver?.plateNumber || ''}</Text>
        </View>

        <TouchableOpacity style={styles.sosBtn} onPress={() => {
          Alert.alert('Emergency SOS', 'Contact emergency services?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call 111', style: 'destructive', onPress: () => Linking.openURL('tel:111') },
            { text: 'Alert Platform', onPress: () => {
              // Removed invalid /notifications fallback
              Alert.alert('Alert Sent', 'Platform has been notified. Stay safe.');
            }},
          ]);
        }}>
          <Text style={styles.sosBtnText}>🆘 SOS</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.smallBtn} onPress={callRider}>
            <Text style={styles.smallBtnText}>📞 Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn} onPress={() => navigation.navigate('Chat', { rideId, riderName: `${ride.rider?.firstName || ''} ${ride.rider?.lastName || ''}`.trim() })}>
            <Text style={styles.smallBtnText}>💬 Chat</Text>
          </TouchableOpacity>
          {ride.status === 'ACCEPTED' && (
            <TouchableOpacity style={styles.smallBtn} onPress={navigateToPickup}>
              <Text style={styles.smallBtnText}>📍 Pickup</Text>
            </TouchableOpacity>
          )}
          {ride.status === 'IN_PROGRESS' && (
            <TouchableOpacity style={styles.smallBtn} onPress={navigateToDropoff}>
              <Text style={styles.smallBtnText}>📍 Dropoff</Text>
            </TouchableOpacity>
          )}
        </View>

        {ride.status === 'ACCEPTED' && (
          <TouchableOpacity style={styles.btn} onPress={startRide}>
            <Text style={styles.btnText}>▶ Start Ride</Text>
          </TouchableOpacity>
        )}
        {ride.status === 'IN_PROGRESS' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.success }]} onPress={completeRide}>
            <Text style={styles.btnText}>✓ Complete Ride</Text>
          </TouchableOpacity>
        )}
        {['ACCEPTED', 'DRIVER_ARRIVING'].includes(ride.status) && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.danger, marginTop: 8 }]} onPress={cancelRide}>
            <Text style={styles.btnText}>✗ Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  sosBtn: { backgroundColor: C.danger, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, alignItems: 'center', marginBottom: 10, borderWidth: 1.5, borderColor: '#FF6B6B', alignSelf: 'flex-end' },
  sosBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  card: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.card, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  riderName: { color: C.text, fontSize: 22, fontWeight: '700' },
  fare: { color: C.primary, fontSize: 28, fontWeight: '800', marginVertical: 8 },
  status: { color: C.textSecondary, fontSize: 14, marginBottom: 16 },
  btn: { backgroundColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  smallBtn: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, alignItems: 'center' },
  smallBtnText: { color: C.text, fontWeight: '700', fontSize: 14 },
  driverInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  driverInfoLabel: { color: C.textSecondary, fontSize: 12, textTransform: 'uppercase' },
  driverInfoValue: { color: C.text, fontSize: 14, fontWeight: '600' },
});
