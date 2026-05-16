import { useTheme } from '../../contexts/ThemeContext';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import client from '../../api/client';

const VEHICLE_TYPES = [
  { key: 'BAJAJ', label: 'Bajaj (Auto-rickshaw)' },
  { key: 'CAR', label: 'Car (Sedan)' },
];

export default function VehicleInfoScreen({ navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const [profile, setProfile] = useState(null);
  const [vehicleType, setVehicleType] = useState('BAJAJ');
  const [plateNumber, setPlateNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehiclePhoto, setVehiclePhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/drivers/profile');
        const p = data.profile;
        setProfile(p);
        setVehicleType(p.vehicleType || 'BAJAJ');
        setPlateNumber(p.plateNumber || '');
        setLicenseNumber(p.licenseNumber || '');
        setVehiclePhoto(p.vehiclePhotoUrl || null);
      } catch (e) {
        console.error('Profile fetch error:', e);
      }
    })();
  }, []);

  const pickVehiclePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        uploadVehiclePhoto(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadVehiclePhoto = async (uri) => {
    setUploading(true);
    try {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      const formData = new FormData();
      formData.append('document', { uri, name: filename || 'vehicle.jpg', type });
      formData.append('type', 'vehicle');
      const { data } = await client.put('/drivers/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVehiclePhoto(data.documentUrl);
      Alert.alert('Success', 'Vehicle photo uploaded!');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!plateNumber.trim() || !licenseNumber.trim()) {
      return Alert.alert('Missing Info', 'Plate number and license number are required');
    }
    setSaving(true);
    try {
      await client.put('/drivers/profile', { vehicleType, plateNumber, licenseNumber });
      Alert.alert('Saved', 'Vehicle info updated');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Vehicle Info</Text>
      <Text style={styles.subtitle}>Update your vehicle type and registration details.</Text>

      <Text style={styles.sectionLabel}>Vehicle Type</Text>
      <View style={styles.typeRow}>
        {VEHICLE_TYPES.map((vt) => (
          <TouchableOpacity
            key={vt.key}
            style={[styles.typeBtn, vehicleType === vt.key && styles.typeActive]}
            onPress={() => setVehicleType(vt.key)}
          >
            <Text style={[styles.typeText, vehicleType === vt.key && styles.typeTextActive]}>
              {vt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vehicle Photo</Text>
        <TouchableOpacity style={styles.photoContainer} onPress={pickVehiclePhoto} disabled={uploading}>
          {vehiclePhoto ? (
            <Image source={{ uri: vehiclePhoto }} style={styles.vehiclePhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>🚗</Text>
              <Text style={styles.photoText}>{uploading ? 'Uploading...' : 'Upload Vehicle Photo'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registration Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Plate Number (e.g. MOG-A123)"
          placeholderTextColor={COLORS.textSecondary}
          value={plateNumber}
          onChangeText={setPlateNumber}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="License Number"
          placeholderTextColor={COLORS.textSecondary}
          value={licenseNumber}
          onChangeText={setLicenseNumber}
        />
      </View>

      {profile && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Approval</Text>
            <Text style={[styles.badge, { color: profile.isApproved ? COLORS.success : COLORS.warning }]}>
              {profile.isApproved ? 'Approved' : 'Pending Review'}
            </Text>
          </View>
          <Text style={styles.note}>
            Changing vehicle info may require re-approval from the admin team.
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Vehicle Info'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 4 },
  subtitle: { color: C.textSecondary, fontSize: 14, marginBottom: 24 },
  sectionLabel: { color: C.textSecondary, fontSize: 12, textTransform: 'uppercase', fontWeight: '700', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  typeBtn: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  typeActive: { borderColor: C.primary, backgroundColor: C.primary + '20' },
  typeText: { color: C.textSecondary, fontWeight: '600', fontSize: 13 },
  typeTextActive: { color: C.primary, fontWeight: '700' },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 14 },
  photoContainer: { width: '100%', alignItems: 'center' },
  vehiclePhoto: { width: '100%', height: 180, borderRadius: 12 },
  photoPlaceholder: { width: '100%', height: 140, borderRadius: 12, backgroundColor: C.background, alignItems: 'center', justifyContent: 'center' },
  photoIcon: { fontSize: 36, marginBottom: 8 },
  photoText: { color: C.textSecondary, fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: C.background, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, fontSize: 15, color: C.text, marginBottom: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { color: C.textSecondary, fontSize: 14 },
  badge: { fontSize: 14, fontWeight: '800' },
  note: { color: C.textSecondary, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  saveBtn: { backgroundColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 40 },
  saveText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
