import { useTheme } from '../../contexts/ThemeContext';
import React, { useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CartContext } from '../../contexts/CartContext';
import client from '../../api/client';

export default function CartScreen({ navigation }) {
  useEffect(() => {
    client.get('/promotions/active').then(({ data }) => {
      setActivePromos(data.data || data || []);
    }).catch(() => {});
  }, []);
  const { colors } = useTheme();
  const COLORS = colors;
  const styles = createStyles(colors);
  const { cart, clearCart, restaurant } = useContext(CartContext);
  const [deliveryMode, setDeliveryMode] = useState('DELIVERY');
  const [ordering, setOrdering] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoApplying, setPromoApplying] = useState(false);
  const [activePromos, setActivePromos] = useState([]);
  const [notes, setNotes] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryMode === 'DELIVERY' ? 1.20 : 0;
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
  const promoOff = promoDiscount || 0;
  const total = Math.max(0, Math.round((subtotal + deliveryFee + serviceFee - promoOff) * 100) / 100);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoApplying(true);
    setPromoError('');
    try {
      const code = promoCode.trim().toUpperCase();
      const promo = activePromos.find(p => p.code === code);
      if (!promo) throw new Error('Invalid promo code');
      if (subtotal < (promo.minOrder || 0)) throw new Error('Order does not meet minimum amount for this promo');
      let discount = 0;
      if (promo.discountType === 'PERCENTAGE') {
        discount = subtotal * (promo.discountValue / 100);
        if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
      } else {
        discount = promo.discountValue;
      }
      setPromoDiscount(Math.round(discount * 100) / 100);
      setPromoError('');
    } catch (e) {
      setPromoDiscount(null);
      setPromoError(e.message || 'Invalid promo code');
    } finally {
      setPromoApplying(false);
    }
  };

  const placeOrder = async () => {
    if (!restaurant || cart.length === 0) return Alert.alert('Error', 'Cart is empty');
    setOrdering(true);
    try {
      let deliveryLatitude = 0;
      let deliveryLongitude = 0;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          deliveryLatitude = loc.coords.latitude;
          deliveryLongitude = loc.coords.longitude;
        }
      } catch (e) {}
      const items = cart.map((item) => ({ menuItemId: item.id, quantity: item.quantity }));
      const { data } = await client.post('/food-orders', {
        restaurantId: restaurant.id,
        items,
        deliveryAddress: 'Current Location',
        deliveryLatitude,
        deliveryLongitude,
        deliveryMode,
        notes: notes.trim(),
      });
      clearCart();
      Alert.alert('Order Placed!', 'Your order has been sent to the restaurant.', [
        { text: 'View Orders', onPress: () => navigation.navigate('Orders') },
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      {cart.length === 0 && (
        <Text style={styles.empty}>Your cart is empty</Text>
      )}

      {cart.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
          </View>
          <Text style={styles.itemPrice}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</Text>
        </View>
      ))}

      {cart.length > 0 && (
        <>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, deliveryMode === 'DELIVERY' && styles.modeBtnActive]}
              onPress={() => setDeliveryMode('DELIVERY')}
            >
              <Text style={[styles.modeText, deliveryMode === 'DELIVERY' && styles.modeTextActive]}>🛵 Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, deliveryMode === 'PICKUP' && styles.modeBtnActive]}
              onPress={() => setDeliveryMode('PICKUP')}
            >
              <Text style={[styles.modeText, deliveryMode === 'PICKUP' && styles.modeTextActive]}>🚶 Pickup</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Promo code"
              placeholderTextColor={COLORS.textSecondary}
              value={promoCode}
              onChangeText={(text) => { setPromoCode(text); setPromoDiscount(null); setPromoError(''); }}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.promoBtn} onPress={applyPromo} disabled={promoApplying || !promoCode.trim()}>
              <Text style={styles.promoBtnText}>{promoApplying ? '...' : 'Apply'}</Text>
            </TouchableOpacity>
          </View>
          {promoDiscount !== null && (
            <View style={styles.promoResult}>
              <Text style={styles.promoSuccess}>Promo -$</Text>
              <Text style={styles.promoAmount}>{promoDiscount.toFixed(2)}</Text>
            </View>
          )}
          {promoError ? <Text style={styles.promoError}>{promoError}</Text> : null}

          <TextInput
            style={styles.notesInput}
            placeholder="Special instructions (allergies, preferences...)"
            placeholderTextColor={COLORS.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            maxLength={200}
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'Free'}</Text>
            </View>
            {promoOff > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Promo Discount</Text>
              <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>-${promoOff.toFixed(2)}</Text>
            </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={placeOrder} disabled={ordering}>
            <Text style={styles.checkoutText}>{ordering ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 16 },
  empty: { color: C.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  itemName: { color: C.text, fontSize: 15, fontWeight: '500' },
  itemQty: { color: C.textSecondary, fontSize: 13 },
  itemPrice: { color: C.primary, fontWeight: '700', fontSize: 15 },
  modeToggle: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  modeBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: C.card, alignItems: 'center' },
  modeBtnActive: { backgroundColor: C.primary },
  modeText: { color: C.textSecondary, fontWeight: '700', fontSize: 15 },
  modeTextActive: { color: '#FFF' },
  promoRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  promoInput: { flex: 1, backgroundColor: C.background, borderRadius: 10, padding: 12, color: C.text, fontSize: 14 },
  promoBtn: { backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  promoBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  promoResult: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#E8F5E9', borderRadius: 8, padding: 10, marginBottom: 8 },
  promoSuccess: { color: '#2E7D32', fontWeight: '600', fontSize: 13 },
  promoAmount: { color: '#1B5E20', fontWeight: '800', fontSize: 13 },
  promoError: { color: C.danger, fontSize: 12, marginBottom: 8 },
  notesInput: { backgroundColor: C.card, borderRadius: 12, padding: 14, color: C.text, fontSize: 14, marginBottom: 16, minHeight: 60, textAlignVertical: 'top' },
  summary: { backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: C.textSecondary, fontSize: 14 },
  summaryValue: { color: C.text, fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, marginBottom: 0 },
  totalLabel: { color: C.text, fontSize: 16, fontWeight: '700' },
  totalValue: { color: C.primary, fontSize: 18, fontWeight: '800' },
  checkoutBtn: { backgroundColor: C.primary, borderRadius: 12, padding: 18, alignItems: 'center' },
  checkoutText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
