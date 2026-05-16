import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_CONFIG } from '../../config';
import api from '../../api/client';

export default function DriverHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [online, setOnline] = useState(false);
  const [rides, setRides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const cfg = ROLE_CONFIG.DRIVER;

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/drivers/profile');
      setRides(data?.rides || data || []);
    } catch {}
  };

  useEffect(() => { fetchProfile(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const toggleOnline = () => setOnline(prev => !prev);

  const stats = [
    { label: 'Today', value: rides.filter(r => r.status === 'completed').length, icon: '✅' },
    { label: 'Earnings', value: `$${rides.reduce((s, r) => s + (r.fare || 0), 0).toFixed(2)}`, icon: '💰' },
    { label: 'Rating', value: user?.rating?.toFixed(1) || '4.5', icon: '⭐' },
    { label: 'Rides', value: rides.length, icon: '🚗' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cfg.color }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {user?.firstName || 'Driver'} 👋</Text>
        <TouchableOpacity
          style={[styles.onlineBtn, { backgroundColor: online ? '#4CAF50' : '#F44336' }]}
          onPress={toggleOnline}
        >
          <Text style={styles.onlineBtnText}>{online ? '● Online' : '○ Offline'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {stats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Ride</Text>
        {rides.filter(r => r.status === 'active' || r.status === 'in_progress').length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🛣️</Text>
            <Text style={styles.emptyText}>No active ride</Text>
            <Text style={styles.emptySubtext}>Go online to start receiving rides</Text>
          </View>
        ) : (
          rides.filter(r => r.status === 'active' || r.status === 'in_progress').map(ride => (
            <TouchableOpacity
              key={ride._id}
              style={styles.rideCard}
              onPress={() => Alert.alert('Coming Soon', 'Ride details will be available soon.')}
            >
              <Text style={styles.rideRoute}>{ride.pickup} → {ride.destination}</Text>
              <Text style={styles.rideFare}>${ride.fare?.toFixed(2)}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Rides</Text>
        {rides.slice(0, 5).map(ride => (
          <View key={ride._id} style={styles.rideItem}>
            <Text style={styles.rideRouteSmall}>{ride.pickup} → {ride.destination}</Text>
            <Text style={styles.rideStatus}>{ride.status}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  onlineBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  onlineBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center', elevation: 2 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#333' },
  emptySubtext: { fontSize: 13, color: '#888', marginTop: 4 },
  rideCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, elevation: 2 },
  rideRoute: { fontSize: 15, fontWeight: '600', color: '#333' },
  rideFare: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold', marginTop: 4 },
  rideItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 6 },
  rideRouteSmall: { fontSize: 13, color: '#555' },
  rideStatus: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
});
