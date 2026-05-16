import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const ROLES = [
  { key: 'RIDER', label: '🚗 Ride', desc: 'Book rides, food delivery, car rental' },
  { key: 'DRIVER', label: '🚕 Drive', desc: 'Accept ride & delivery requests' },
  { key: 'STORE_OWNER', label: '🏪 Store', desc: 'Manage restaurant or car rental' },
  { key: 'SERVICE_PROVIDER', label: '🔧 Services', desc: 'Offer handyman, plumbing & more' },
];

export default function RoleSelectScreen({ navigation }) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(null);
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.subtitle}>Choose your account type</Text>
      {ROLES.map(role => (
        <TouchableOpacity
          key={role.key}
          style={[styles.card, selected === role.key && styles.cardSelected]}
          onPress={() => setSelected(role.key)}
        >
          <Text style={styles.cardIcon}>{role.label}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>{role.key.replace('_', ' ')}</Text>
            <Text style={styles.cardDesc}>{role.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.btn, !selected && styles.btnDisabled]}
        onPress={() => selected && navigation.navigate('Register', { role: selected })}
        disabled={!selected}
      >
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkBtn}>
        <Text style={styles.link}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: 24, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 220, height: 120, marginBottom: 8 },
  subtitle: { color: C.textSecondary, fontSize: 16, marginBottom: 24 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: C.border, width: '100%' },
  cardSelected: { borderColor: C.primary },
  cardIcon: { fontSize: 32, marginRight: 16 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700', color: C.text },
  cardDesc: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  btn: { backgroundColor: C.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 16, width: '100%' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  link: { color: C.primary, fontSize: 15, fontWeight: '600' },
});
