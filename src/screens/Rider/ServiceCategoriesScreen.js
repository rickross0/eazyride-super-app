import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';

const CATEGORIES = [
  { id: 'Rides', title: 'Rides', icon: '🚕' },
  { id: 'Delivery', title: 'Delivery', icon: '📦' },
  { id: 'Car Rental', title: 'Car Rental', icon: '🚗' },
  { id: 'Food', title: 'Food', icon: '🍔' },
  { id: 'Services', title: 'Services', icon: '🔧' },
];

export default function ServiceCategoriesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>What do you need?</Text>
      <Text style={styles.subheading}>Choose a category to get started</Text>

      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ServiceListings', { category: cat.id })}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{cat.icon}</Text>
            </View>
            <Text style={styles.cardTitle}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 6 },
  subheading: { fontSize: 15, color: C.textSecondary, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFD70020',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: { fontSize: 32 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, textAlign: 'center' },
});
