import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';

export default function DriverOrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/drivers/profile');
      setRides(data?.rides || data || []);
    } catch {}
  };

  useEffect(() => { fetchRides(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRides();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Alert.alert('Coming Soon', 'Ride details will be available soon.')}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.route}>{item.pickup} → {item.destination}</Text>
        <Text style={[styles.status, { color: item.status === 'completed' ? '#4CAF50' : '#FF9800' }]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.fare}>${item.fare?.toFixed(2) || '0.00'}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>No rides yet</Text>
          </View>
        }
        contentContainerStyle={rides.length === 0 ? { flex: 1 } : {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, paddingTop: 50, color: '#333' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  status: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  fare: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50' },
  date: { fontSize: 12, color: '#888' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#888' },
});
