import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function RatingStars({ rating, size = 14 }) {
  const stars = '★'.repeat(Math.round(rating || 0)) + '☆'.repeat(5 - Math.round(rating || 0));
  return <Text style={{ fontSize: size, color: '#FFD700' }}>{stars}</Text>;
}

export function Button({ title, onPress, style, textStyle, disabled }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.btn, style, disabled && styles.btnDisabled]}>
      <Text style={[styles.btnText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function PriceDisplay({ amount, currency = '$', style }) {
  return <Text style={[styles.price, style]}>{currency}{typeof amount === 'number' ? amount.toFixed(2) : '0.00'}</Text>;
}

export function StepIndicator({ currentStep, totalSteps }) {
  return (
    <View style={styles.stepRow}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View key={i} style={[styles.stepDot, i < currentStep && styles.stepActive, i === currentStep && styles.stepCurrent]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: '#FFD700', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#FFD700' },
  stepRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 12 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E0E0E0' },
  stepActive: { backgroundColor: '#FFD700' },
  stepCurrent: { backgroundColor: '#FF9500' },
});
