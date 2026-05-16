import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import client from '../../api/client';
import Toast from 'react-native-toast-message';

export default function RegisterScreen({ navigation, route }) {
  const { colors } = useTheme();
  const role = route?.params?.role || 'RIDER';
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hydrateSession } = useAuth();
  const styles = createStyles(colors);
  const roleColor = ROLE_COLORS[role] || colors.primary;
  const roleLabel = ROLE_LABELS[role] || role;

  const handleRegister = async () => {
    if (!phone || !password || !firstName || !lastName) {
      return Toast.show({ type: 'error', text1: 'Error', text2: 'Fill in all fields' });
    }
    if (!termsAccepted) {
      return Toast.show({ type: 'error', text1: 'Error', text2: 'You must accept the Terms & Conditions' });
    }
    const formattedPhone = phone.startsWith('+') ? phone : '+252' + phone.replace(/^0/, '');
    setLoading(true);
    try {
      const client = (await import('../../api/client')).default;
      const { data } = await client.post('/auth/register', {
        phone: formattedPhone, password, firstName, lastName, role, termsAccepted: true,
        ...(role === 'STORE_OWNER' ? { storeType: 'RESTAURANT' } : {}),
        ...(role === 'SERVICE_PROVIDER' ? { category: 'CAR_RENTAL' } : {}),
      });
      const responseData = data.data || data;
      await hydrateSession(responseData.accessToken, responseData.user);
      Toast.show({ type: 'success', text1: `Welcome, ${responseData.user?.firstName || 'User'}!` });
      setLoading(false); // Fallback in case navigator transition is delayed
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: e.response?.data?.error || e.response?.data?.message || 'Registration failed' });
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.subtitle}>Create {roleLabel} Account</Text>
      <View style={[styles.roleBadge, { backgroundColor: roleColor + '20', borderColor: roleColor }]}>
        <Text style={[styles.roleBadgeText, { color: roleColor }]}>{roleLabel}</Text>
      </View>
      <TextInput style={styles.input} placeholder="Phone (+252...)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={colors.textSecondary} />
      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} placeholderTextColor={colors.textSecondary} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} placeholderTextColor={colors.textSecondary} />
      <TextInput style={styles.input} placeholder="Password (min 6 chars)" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={colors.textSecondary} />
      <TouchableOpacity style={styles.tcRow} onPress={() => setTermsAccepted(!termsAccepted)}>
        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>{termsAccepted && <Text style={styles.checkmark}>✓</Text>}</View>
        <Text style={styles.tcText}>I agree to the Terms & Conditions</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, (!termsAccepted || loading) && styles.btnDisabled]} onPress={handleRegister} disabled={!termsAccepted || loading}>
        <Text style={styles.btnText}>{loading ? 'Creating...' : 'Register'}</Text>
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
  subtitle: { color: C.textSecondary, fontSize: 16, marginBottom: 16 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  roleBadgeText: { fontSize: 14, fontWeight: '700' },
  input: { backgroundColor: C.card, borderRadius: 14, padding: 16, color: C.text, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, width: '100%' },
  tcRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '100%' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.border, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: C.primary, borderColor: C.primary },
  checkmark: { color: '#FFF', fontSize: 14 },
  tcText: { color: C.textSecondary, fontSize: 14 },
  btn: { backgroundColor: C.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginBottom: 16, width: '100%' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
  linkBtn: { alignItems: 'center' },
  link: { color: C.primary, fontSize: 15, fontWeight: '600' },
});
