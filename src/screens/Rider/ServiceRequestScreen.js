import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

const SERVICE_TYPES = ['Plumbing', 'Electrical', 'Cleaning', 'Repair', 'Moving', 'Painting', 'Other'];

export default function ServiceRequestScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { provider } = route.params || {};
  const COLORS = colors;
  const styles = createStyles(colors);

  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (user?.phone && !phone) setPhone(user.phone);
  }, [user?.phone]);

  const submit = async () => {
    if (!serviceType.trim() || !description.trim() || !location.trim() || !phone.trim()) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please fill in all fields before submitting.' });
      return;
    }

    Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Service requests will be available in a future update.' });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>🔧 Request a Service</Text>
      {provider?.businessName && (
        <Text style={styles.provider}>Requesting: {provider.businessName}</Text>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Service Type</Text>
        <TouchableOpacity
          style={styles.select}
          onPress={() => setShowPicker((s) => !s)}
        >
          <Text style={serviceType ? styles.selectText : styles.selectPlaceholder}>
            {serviceType || 'Select a service type'}
          </Text>
          <Text style={styles.chevron}>{showPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showPicker && (
          <View style={styles.picker}>
            {SERVICE_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.pickerItem, serviceType === t && styles.pickerItemActive]}
                onPress={() => { setServiceType(t); setShowPicker(false); }}
              >
                <Text style={[styles.pickerText, serviceType === t && styles.pickerTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={4}
          placeholder="Describe what you need..."
          placeholderTextColor={COLORS.textSecondary}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your address or location"
          placeholderTextColor={COLORS.textSecondary}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          placeholderTextColor={COLORS.textSecondary}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitBtn]}
        onPress={submit}
       
      >
        <Text style={styles.submitText}>Submit Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  heading: { fontSize: 26, fontWeight: '800', color: C.text, paddingHorizontal: 20, paddingTop: 20, marginBottom: 4 },
  provider: { fontSize: 14, color: C.textSecondary, paddingHorizontal: 20, marginBottom: 16 },
  field: { paddingHorizontal: 20, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: C.textSecondary, marginBottom: 8, letterSpacing: 0.3 },
  input: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    color: C.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: C.border,
  },
  textarea: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    color: C.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: C.border,
    minHeight: 100,
  },
  select: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: { color: C.text, fontSize: 15, fontWeight: '600' },
  selectPlaceholder: { color: C.textSecondary, fontSize: 15 },
  chevron: { color: C.textSecondary, fontSize: 12 },
  picker: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 8,
    overflow: 'hidden',
  },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  pickerItemActive: { backgroundColor: '#FFD70020' },
  pickerText: { color: C.text, fontSize: 15 },
  pickerTextActive: { color: '#FFD700', fontWeight: '700' },
  submitBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: '#000', fontWeight: '800', fontSize: 16 },
});
