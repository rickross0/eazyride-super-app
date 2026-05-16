import { useTheme } from '../../contexts/ThemeContext';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import client from '../../api/client';

const STATUS_COLORS_RIDE = {
  COMPLETED: 'success',
  CANCELLED: 'danger',
  IN_PROGRESS: 'warning',
  DRIVER_ASSIGNED: 'warning',
  REQUESTED: 'textSecondary',
};

const STATUS_COLORS_ORDER = {
  DELIVERED: 'success',
  CANCELLED: 'danger',
  OUT_FOR_DELIVERY: 'warning',
  PICKUP_CONFIRMED: 'warning',
  DRIVER_ASSIGNED: 'warning',
  PENDING: 'textSecondary',
  CONFIRMED: 'primary',
  PREPARING: 'primary',
  READY: 'primary',
};

export default function RideRequestsScreen({ navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const [activeTab, setActiveTab] = useState('rides');
  const [rides, setRides] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = async () => {
    try {
      const { data } = await client.get('/drivers/rides');
      setRides(data?.data || []);
    } catch (e) {
      console.error('Fetch rides error:', e);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const { data } = await client.get('/food-orders/driver/deliveries');
      setDeliveries(data?.orders || data?.data || []);
    } catch (e) {
      console.error('Fetch deliveries error:', e);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchRides(), fetchDeliveries()]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const renderRide = ({ item: ride }) => (
    <TouchableOpacity
      style={styles.rideCard}
      onPress={() => {
        if (ride.status === 'IN_PROGRESS' || ride.status === 'DRIVER_ASSIGNED' || ride.status === 'ACCEPTED') {
          navigation.navigate('ActiveRide', { rideId: ride.id });
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.rideHeader}>
        <Text numberOfLines={1} style={[styles.rideStatus, { color: COLORS[STATUS_COLORS_RIDE[ride.status]] || COLORS.textSecondary }]}>
          {ride.status?.replace(/_/g, ' ')}
        </Text>
        <Text style={styles.rideFare}>${(ride.fare || 0).toFixed(2)}</Text>
      </View>
      <Text style={styles.rideRider}>
        {ride.rider?.firstName} {ride.rider?.lastName}
      </Text>
      <Text style={styles.rideMeta}>
        {(ride.distance || 0).toFixed(1)} km  •  {ride.vehicleType}  •  {formatDate(ride.completedAt || ride.startedAt || ride.createdAt)}
      </Text>
    </TouchableOpacity>
  );

  const renderDelivery = ({ item: order }) => (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <Text numberOfLines={1} style={[styles.rideStatus, { color: COLORS[STATUS_COLORS_ORDER[order.status]] || COLORS.textSecondary }]}>
          {order.status?.replace(/_/g, ' ')}
        </Text>
        <Text style={styles.rideFare}>${(order.totalAmount || 0).toFixed(2)}</Text>
      </View>
      <Text style={styles.rideRider}>
        {order.store?.name || 'Restaurant'}
      </Text>
      <Text style={styles.rideMeta}>
        {order.items?.length || 0} items  •  {formatDate(order.deliveredAt || order.pickedUpAt || order.createdAt)}
      </Text>
      <Text style={styles.rideMeta} numberOfLines={1}>
        📍 {order.deliveryAddress}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ride History</Text>
        <Text style={styles.empty}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, activeTab === 'rides' && styles.tabActive]} onPress={() => setActiveTab('rides')}>
          <Text style={[styles.tabText, activeTab === 'rides' && styles.tabTextActive]}>🚗 Rides ({rides.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'deliveries' && styles.tabActive]} onPress={() => setActiveTab('deliveries')}>
          <Text style={[styles.tabText, activeTab === 'deliveries' && styles.tabTextActive]}>📦 Deliveries ({deliveries.length})</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'rides' ? (
        <FlatList
          data={rides}
          keyExtractor={(r) => r.id}
          renderItem={renderRide}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No rides yet. Go online to start receiving requests.</Text>}
          contentContainerStyle={rides.length === 0 && { flex: 1 }}
        />
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(d) => d.id}
          renderItem={renderDelivery}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No deliveries yet. Enable deliveries to receive food orders.</Text>}
          contentContainerStyle={deliveries.length === 0 && { flex: 1 }}
        />
      )}
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 16 },
  tabRow: { flexDirection: 'row', marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, marginHorizontal: 4 },
  tabActive: { backgroundColor: C.primary, borderColor: C.primary },
  tabText: { color: C.textSecondary, fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: '#FFF' },
  empty: { color: C.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 40 },
  rideCard: { backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 12 },
  rideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  rideStatus: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  rideFare: { fontSize: 18, fontWeight: '800', color: C.primary },
  rideRider: { color: C.text, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  rideMeta: { color: C.textSecondary, fontSize: 12 },
});
