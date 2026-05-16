import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function RiderHomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(colors);

  const actions = [
    { icon: '🚗', label: 'Book Ride', screen: 'RideRequest' },
    { icon: '🍔', label: 'Order Food', screen: 'Stores' },
    { icon: '🚙', label: 'Rent Car', screen: 'CarRental' },
        { icon: '💰', label: 'Wallet', screen: 'Wallet' },
    { icon: '📋', label: 'History', screen: 'History' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hi, {user?.firstName || 'Rider'}!</Text>
      <Text style={styles.subheading}>Where are you going?</Text>
      <View style={styles.grid}>
        {actions.map(action => (
          <TouchableOpacity key={action.label} style={styles.actionCard} onPress={() => navigation.navigate(action.screen)}>
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: 20 },
  greeting: { fontSize: 28, fontWeight: '800', color: C.text },
  subheading: { fontSize: 16, color: C.textSecondary, marginTop: 4, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center' },
  actionIcon: { fontSize: 36, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: C.text },
});
