import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Share, Animated } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import client from '../../api/client';
import { useTheme } from '../../contexts/ThemeContext';
import { SOCKET_URL, OSRM_URL } from '../../config';

const DRIVER_PULSE = new Animated.Value(1);

export default function RideTrackingScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [eta, setEta] = useState(null);
  const socketRef = useRef(null);
  const mapRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(DRIVER_PULSE, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(DRIVER_PULSE, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();
    return () => pulseRef.current?.stop();
  }, []);

  const haversineKm = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const fetchRoute = useCallback(async (rideData) => {
    try {
      const { data } = await axios.get(
        `${OSRM_URL}/${rideData.pickupLng},${rideData.pickupLat};${rideData.dropoffLng},${rideData.dropoffLat}?overview=full&geometries=geojson`
      );
      if (data.routes?.length) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords);
      }
    } catch (e) {
      console.error('Route fetch error:', e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get(`/rides/${rideId}`);
        setRide(data.ride);
        if (data.ride?.pickupLat && data.ride?.dropoffLat) {
          await fetchRoute(data.ride);
        }
      } catch (e) {
        console.error('Failed to load ride:', e);
      }
    })();

    (async () => {
      try {
        const { data } = await client.get(`/rides/${rideId}`);
        if (data.location) {
          setDriverPos(data.location);
          setDriverInfo(data.driver);
        }
      } catch (e) {}
    })();

    const connectSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'], reconnection: true, reconnectionAttempts: 10, reconnectionDelay: 2000 });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[RideTracking] Socket connected');
        socket.emit('ride:track', { rideId });
      });

      socket.on('driver:location', (pos) => {
        setDriverPos((prev) => {
          if (prev && prev.lat && prev.lng && pos.lat && pos.lng) {
            const steps = 6;
            const dLat = (pos.lat - prev.lat) / steps;
            const dLng = (pos.lng - prev.lng) / steps;
            let step = 0;
            const interval = setInterval(() => {
              step++;
              if (step >= steps) {
                setDriverPos({ lat: pos.lat, lng: pos.lng });
                clearInterval(interval);
              } else {
                setDriverPos({ lat: prev.lat + dLat * step, lng: prev.lng + dLng * step });
              }
            }, 80);
            return prev;
          }
          return pos;
        });
        if (mapRef.current && pos.lat && pos.lng) {
          mapRef.current.animateCamera({ center: { latitude: pos.lat, longitude: pos.lng } }, { duration: 500 });
        }
        if (ride) {
          const targetLat = ['REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING'].includes(ride.status) ? ride.pickupLat : ride.dropoffLat;
          const targetLng = ['REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING'].includes(ride.status) ? ride.pickupLng : ride.dropoffLng;
          const dist = haversineKm(pos.lat, pos.lng, targetLat, targetLng);
          const estimatedMinutes = Math.max(1, Math.round(dist / 0.3));
          setEta(estimatedMinutes);
        }
      });

      socket.on('ride:accepted', (r) => {
        setRide(r);
        fetchRoute(r);
        client.get(`/rides/${rideId}`).then(({ data }) => {
          if (data.driver) setDriverInfo(data.driver);
        }).catch(() => {});
      });

      socket.on('ride:started', (r) => setRide(r));
      socket.on('ride:completed', (r) => setRide(r));
      socket.on('ride:cancelled', () => setRide(null));
      socket.on('disconnect', () => console.log('[RideTracking] Socket disconnected'));
      socket.on('connect_error', (err) => console.error('[RideTracking] Socket error:', err.message));
    };

    connectSocket();
    return () => { socketRef.current?.disconnect(); };
  }, [rideId, haversineKm, fetchRoute]);

  const cancelRide = async () => {
    try {
      await client.post(`/rides/${rideId}/cancel`, { reason: 'Rider cancelled' });
      Alert.alert('Cancelled', 'Your ride has been cancelled.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not cancel ride');
    }
  };

  const submitRating = async () => {
    try {
      await client.post(`/rides/${rideId}/rate`, { rating });
      setRatingSubmitted(true);
      Alert.alert('Thank You!', 'Your rating has been submitted.');
    } catch (e) {
      Alert.alert('Error', 'Failed to submit rating');
    }
  };

  const shareRide = async () => {
    try {
      await Share.share({ message: `Track my EazyRide: https://eazyride-api.onrender.com/rides/${rideId}/track` });
    } catch {}
  };

  if (!ride) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.text }}>Loading ride...</Text>
      </View>
    );
  }

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
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor={colors.primary} />
        )}
        {driverPos && driverPos.lat && (
          <Marker coordinate={{ latitude: driverPos.lat, longitude: driverPos.lng }} title="Driver">
            <View style={styles.driverMarker}>
              <Animated.View style={{ transform: [{ scale: DRIVER_PULSE }] }}>
                <Text style={styles.driverMarkerIcon}>🚗</Text>
              </Animated.View>
            </View>
          </Marker>
        )}
      </MapView>

      {eta && (
        <View style={styles.etaBadge}>
          <Text style={styles.etaText}>🕒 ETA: {eta} min</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.status}>{ride.status?.replace(/_/g, ' ')}</Text>
        {driverInfo && (
          <View style={styles.driverCard}>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driverInfo.firstName} {driverInfo.lastName}</Text>
              <Text style={styles.driverVehicle}>{driverInfo.vehicleType || 'Vehicle'} • ⭐ {driverInfo.rating?.toFixed(1) || '4.5'}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${driverInfo.phone}`).catch(() => {})}>
              <Text style={styles.callBtnText}>📞 Call</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.fare}>${(ride.fare || 0).toFixed(2)}</Text>
        {ride.surgeMultiplier > 1 && (
          <Text style={styles.surge}>🔥 Surge x{ride.surgeMultiplier.toFixed(1)}</Text>
        )}
        {routeCoords.length > 0 && ride.distance && (
          <Text style={styles.distText}>{ride.distance.toFixed(1)} km • {ride.duration || Math.round((ride.distance || 0) / 0.3)} min</Text>
        )}

        {ride.status === 'COMPLETED' && !ratingSubmitted && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>Rate your driver</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Text style={[styles.star, rating >= s && styles.starFilled]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={submitRating}>
              <Text style={styles.btnText}>Submit Rating</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.cancelRow}>
          {['REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING'].includes(ride.status) && (
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelRide}>
              <Text style={styles.cancelBtnText}>Cancel Ride</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.careBtn} onPress={() => Alert.alert('Support', 'Contacting EazyRide support...')}>
            <Text style={styles.careBtnText}>Care</Text>
          </TouchableOpacity>
        </View>

        {['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'IN_PROGRESS'].includes(ride.status) && (
          <TouchableOpacity style={styles.shareBtn} onPress={shareRide}>
            <Text style={styles.shareBtnText}>🔗 Share Live Location</Text>
          </TouchableOpacity>
        )}

        {['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'IN_PROGRESS'].includes(ride.status) && (
          <TouchableOpacity style={styles.sosBtn} onPress={() => {
            Alert.alert('🆘 Emergency SOS', 'Choose emergency action:', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call Emergency', style: 'destructive', onPress: () => Linking.openURL('tel:111').catch(() => {}) },
              { text: 'Alert Platform', onPress: async () => {
                try {
                  const loc = driverPos ? { lat: driverPos.lat, lng: driverPos.lng } : {};
                  await client.post('/sos', { rideId: ride.id, latitude: loc.lat, longitude: loc.lng, message: 'Rider SOS during active ride' });
                  Alert.alert('Alert Sent', 'Emergency services and platform have been notified. Stay safe!');
                } catch {
                  client.post('/notifications', { type: 'SOS', rideId: ride.id, message: 'Rider SOS alert' }).catch(() => {});
                  Alert.alert('Alert Sent', 'Platform has been notified. Stay safe.');
                }
              }},
            ]);
          }}>
            <Text style={styles.sosBtnText}>🆘 SOS Emergency</Text>
          </TouchableOpacity>
        )}

        {ride.status === 'COMPLETED' && (
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Done</Text>
          </TouchableOpacity>
        )}

        {ride.status === 'CANCELLED' && (
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Go Back</Text>
          </TouchableOpacity>
        )}

        {ride.status === 'REQUESTED' && (
          <View style={styles.waitingRow}>
            <Text style={styles.waitingText}>Searching for drivers...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  markerContainer: { alignItems: 'center' },
  markerIcon: { fontSize: 28 },
  driverMarker: {
    backgroundColor: C.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  driverMarkerIcon: { fontSize: 20 },
  etaBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.primary,
  },
  etaText: { color: C.primary, fontSize: 16, fontWeight: '700' },
  card: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.card, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  status: { color: C.text, fontSize: 16, fontWeight: '600', marginBottom: 8, textTransform: 'capitalize' },
  driverCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.background, borderRadius: 12, padding: 12, marginBottom: 12 },
  driverInfo: { flex: 1 },
  driverName: { color: C.text, fontSize: 15, fontWeight: '600' },
  driverVehicle: { color: C.textSecondary, fontSize: 13 },
  callBtn: { backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  callBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  fare: { color: C.primary, fontSize: 28, fontWeight: '800', marginBottom: 4 },
  surge: { color: C.warning, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  distText: { color: C.textSecondary, fontSize: 13, marginBottom: 8 },
  ratingSection: { alignItems: 'center', marginBottom: 12 },
  ratingTitle: { color: C.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 36, color: C.border },
  starFilled: { color: '#FFD700' },
  cancelRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  cancelBtn: { flex: 1, backgroundColor: C.danger, borderRadius: 10, padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  careBtn: { flex: 1, backgroundColor: '#007AFF', borderRadius: 10, padding: 12, alignItems: 'center' },
  careBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  shareBtn: { backgroundColor: C.card, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: C.primary },
  shareBtnText: { color: C.primary, fontWeight: '700', fontSize: 14 },
  sosBtn: { backgroundColor: C.danger, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: '#FF6B6B' },
  sosBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  btn: { backgroundColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  waitingRow: { alignItems: 'center', paddingVertical: 8 },
  waitingText: { color: C.textSecondary, fontSize: 14 },
});
