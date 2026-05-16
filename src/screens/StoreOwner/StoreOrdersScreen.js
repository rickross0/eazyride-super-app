import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/client';

export default function StoreOrdersScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pins, setPins] = useState({});
  const [verifying, setVerifying] = useState({});

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/food-orders/store');
      const list = data?.orders || data?.data?.orders || data?.data || [];
      setOrders(list);
    } catch (e) {
      console.error('Failed to fetch store orders:', e);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const verifyPickup = async (orderId) => {
    const pin = pins[orderId]?.trim();
    if (!pin) {
      Alert.alert('PIN Required', 'Please enter the 4-digit PIN shown by the driver.');
      return;
    }
    setVerifying((prev) => ({ ...prev, [orderId]: true }));
    try {
      const { data } = await api.put(`/food-orders/${orderId}/verify-pickup`, { pin });
      if (data.verified) {
        Alert.alert('Pickup Confirmed', 'Driver pickup verified successfully.');
        await fetchOrders();
        setPins((prev) => ({ ...prev, [orderId]: '' }));
      } else {
        Alert.alert('Verification Failed', data.error || 'Invalid PIN. Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to verify pickup. Check PIN and try again.');
    } finally {
      setVerifying((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'pickup_confirmed': return colors.success || '#4CAF50';
      case 'cancelled': return colors.danger || '#F44336';
      case 'pending': return colors.warning || '#FF9800';
      case 'driver_arrived': return colors.primary || '#FFD700';
      case 'driver_assigned': return '#2196F3';
      default: return colors.textSecondary || '#888';
    }
  };

  const renderItem = ({ item }) => {
    const status = item.status || 'PENDING';
    const showPinInput = status === 'DRIVER_ARRIVED';
    const isVerifying = verifying[item.id] || false;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.orderId}>Order #{item.id?.slice(-6) || item.id}</Text>
          <Text style={[styles.status, { color: statusColor(status) }]} >{status.replace(/_/g, ' ')}</Text>
        </View>
        <Text style={styles.items}>{item.items?.length || 0} items · ${item.total?.toFixed(2) || item.totalAmount?.toFixed(2) || '0.00'}</Text>
        <Text style={styles.date}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>

        {showPinInput && (
          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>Driver has arrived. Enter PIN to confirm pickup:</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor={colors.textSecondary || '#888'}
              keyboardType="number-pad"
              maxLength={4}
              value={pins[item.id] || ''}
              onChangeText={(text) => setPins((prev) => ({ ...prev, [item.id]: text }))}
              editable={!isVerifying}
            />
            <TouchableOpacity
              style={[styles.verifyBtn, isVerifying && { opacity: 0.6 }]}
              onPress={() => verifyPickup(item.id)}
              disabled={isVerifying}
            >
              <Text style={styles.verifyBtnText}>
                {isVerifying ? 'Verifying...' : '✓ Confirm Pickup'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Store Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        }
        contentContainerStyle={orders.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
      />
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, paddingTop: 50, color: C.text },
  card: { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 15, fontWeight: '600', color: C.text },
  status: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  items: { fontSize: 14, color: C.textSecondary, marginTop: 4 },
  date: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  pinSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  pinLabel: { fontSize: 13, color: C.textSecondary, marginBottom: 8, fontWeight: '600' },
  pinInput: {
    backgroundColor: C.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 10,
  },
  verifyBtn: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  verifyBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, color: C.textSecondary },
});
