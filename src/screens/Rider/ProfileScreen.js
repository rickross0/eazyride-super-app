import { useTheme } from '../../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image, Linking } from 'react-native';
import { Modal } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import client from '../../api/client';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const COLORS = colors;
  const styles = createStyles(colors);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState({ phone: '', whatsapp: '', email: '' });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const [tcContent, setTcContent] = useState('');
  const [showTcModal, setShowTcModal] = useState(false);

  useEffect(() => {
    fetchAddresses();
    (async () => {
      try {
        const { data } = await client.get('/settings/support-contacts');
        setContacts({ phone: data.phone || '', whatsapp: data.whatsapp || '', email: data.email || '' });
      } catch {}
    })();
  }, []);

  const showTerms = async () => {
    try {
      const { data } = await client.get('/settings/legal/terms');
      setTcContent(data.content);
    } catch { setTcContent('Unable to load Terms & Conditions.'); }
    setShowTcModal(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        uploadAvatar(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAvatar = async (uri) => {
    setUploading(true);
    try {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      const formData = new FormData();
      formData.append('avatar', { uri, name: filename || 'avatar.jpg', type });
      const { data } = await client.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(data.avatarUrl);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to upload photo');
    }
    setUploading(false);
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await client.get('/addresses');
      setSavedAddresses(data.addresses || []);
    } catch {}
  };

  const addAddress = async () => {
    if (!newLabel.trim() || !newLat || !newLng) {
      return Alert.alert('Error', 'Label and coordinates are required');
    }
    setSaving(true);
    try {
      await client.post('/addresses', {
        label: newLabel.trim(),
        address: newAddress.trim() || null,
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLng),
      });
      setNewLabel(''); setNewAddress(''); setNewLat(''); setNewLng('');
      setShowAddAddress(false);
      fetchAddresses();
      Alert.alert('Saved', 'Address added');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    Alert.alert('Delete Address', 'Remove this saved address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await client.delete(`/addresses/${id}`);
          fetchAddresses();
        } catch {}
      }},
    ]);
  };

  const formatDate = (dateStr) => {
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '—'; }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>{uploading ? '⏳' : '📷'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        {user?.email ? <Text style={styles.phone}>{user.email}</Text> : null}
        {user?.gender ? <Text style={styles.phone}>{user.gender}</Text> : null}
        {user?.createdAt ? <Text style={styles.memberSince}>Member since {formatDate(user.createdAt)}</Text> : null}
      </View>

      <View style={styles.themeRow}>
        <Text style={styles.label}>Light</Text>
        <TouchableOpacity style={[styles.toggleTrack, { backgroundColor: isDark ? COLORS.primary : COLORS.border }]} onPress={toggleTheme} activeOpacity={0.8}>
          <View style={[styles.toggleThumb, { marginLeft: isDark ? 22 : 2 }]} />
        </TouchableOpacity>
        <Text style={styles.label}>Dark</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Saved Addresses</Text>
        <TouchableOpacity onPress={() => setShowAddAddress(!showAddAddress)}>
          <Text style={styles.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {savedAddresses.map((addr) => (
        <View key={addr.id} style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <Text style={styles.addressEmoji}>{addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '💼' : '📍'}</Text>
          </View>
          <View style={styles.addressInfo}>
            <Text style={styles.addressLabel}>{addr.label}</Text>
            <Text style={styles.addressText} numberOfLines={1}>{addr.address || `${addr.latitude}, ${addr.longitude}`}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteAddress(addr.id)}>
            <Text style={styles.deleteBtn}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
      {savedAddresses.length === 0 && <Text style={styles.emptyText}>No saved addresses yet</Text>}

      {showAddAddress && (
        <View style={styles.addCard}>
          <TextInput style={styles.input} placeholder="Label (e.g. Home)" placeholderTextColor={COLORS.textSecondary} value={newLabel} onChangeText={setNewLabel} />
          <TextInput style={styles.input} placeholder="Address (optional)" placeholderTextColor={COLORS.textSecondary} value={newAddress} onChangeText={setNewAddress} />
          <View style={styles.coordRow}>
            <TextInput style={styles.coordInput} placeholder="Latitude" placeholderTextColor={COLORS.textSecondary} value={newLat} onChangeText={setNewLat} keyboardType="decimal-pad" />
            <TextInput style={styles.coordInput} placeholder="Longitude" placeholderTextColor={COLORS.textSecondary} value={newLng} onChangeText={setNewLng} keyboardType="decimal-pad" />
          </View>
          <View style={styles.addActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddAddress(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={addAddress} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {(contacts.phone || contacts.whatsapp || contacts.email) ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📞 Contact Care</Text>
        </View>
      ) : null}
      {contacts.whatsapp ? (
        <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('https://wa.me/' + contacts.whatsapp)}>
          <Text style={styles.contactEmoji}>💬</Text>
          <Text style={styles.contactLabel}>WhatsApp</Text>
        </TouchableOpacity>
      ) : null}
      {contacts.phone ? (
        <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('tel:' + contacts.phone)}>
          <Text style={styles.contactEmoji}>📞</Text>
          <Text style={styles.contactLabel}>Call Us</Text>
        </TouchableOpacity>
      ) : null}
      {contacts.email ? (
        <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('mailto:' + contacts.email)}>
          <Text style={styles.contactEmoji}>✉️</Text>
          <Text style={styles.contactLabel}>Email</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.tcRow} onPress={showTerms}>
        <Text style={styles.tcRowEmoji}>📜</Text>
        <Text style={styles.tcRowText}>Terms & Conditions</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
      <Modal visible={showTcModal} animationType="slide" transparent>
        <View style={styles.tcModalOverlay}>
          <View style={styles.tcModalContent}>
            <Text style={styles.tcModalTitle}>Terms & Conditions</Text>
            <ScrollView>
              <Text style={styles.tcModalText}>{tcContent}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.tcModalClose} onPress={() => setShowTcModal(false)}>
              <Text style={styles.tcModalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 16 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 24, marginBottom: 20, alignItems: 'center', borderTopWidth: 3, borderTopColor: C.primary, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderText: { color: '#FFF', fontSize: 28, fontWeight: '700' },
  avatarBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: C.primary, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.card },
  avatarBadgeText: { fontSize: 10 },
  name: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
  phone: { fontSize: 16, color: C.textSecondary },
  memberSince: { fontSize: 13, color: C.textSecondary, fontStyle: 'italic', marginTop: 4 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 },
  label: { color: C.textSecondary, fontSize: 14, fontWeight: '600' },
  toggleTrack: { width: 46, height: 26, borderRadius: 13, justifyContent: 'center' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  addBtn: { color: C.primary, fontWeight: '700', fontSize: 15 },
  addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8 },
  addressIcon: { marginRight: 12 },
  addressEmoji: { fontSize: 24 },
  addressInfo: { flex: 1 },
  addressLabel: { color: C.text, fontWeight: '600', fontSize: 15, marginBottom: 2 },
  addressText: { color: C.textSecondary, fontSize: 13 },
  deleteBtn: { color: C.danger, fontWeight: '600', fontSize: 13, paddingHorizontal: 8 },
  emptyText: { color: C.textSecondary, textAlign: 'center', marginVertical: 16, fontSize: 14 },
  addCard: { backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 16 },
  input: { backgroundColor: C.background, borderRadius: 10, padding: 12, color: C.text, fontSize: 14, marginBottom: 10 },
  coordRow: { flexDirection: 'row', gap: 8 },
  coordInput: { flex: 1, backgroundColor: C.background, borderRadius: 10, padding: 12, color: C.text, fontSize: 14, marginBottom: 10 },
  addActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  cancelText: { color: C.textSecondary, fontWeight: '600' },
  saveBtn: { backgroundColor: C.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  saveText: { color: '#FFF', fontWeight: '700' },
  logoutBtn: { backgroundColor: C.danger, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8 },
  contactEmoji: { fontSize: 22, marginRight: 12 },
  contactLabel: { color: C.text, fontSize: 16, fontWeight: '600' },
  logoutText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  tcRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 16, marginTop: 16 },
  tcRowEmoji: { fontSize: 20, marginRight: 12 },
  tcRowText: { color: C.text, fontSize: 16, fontWeight: '600' },
  tcModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  tcModalContent: { backgroundColor: C.card, borderRadius: 16, padding: 20, maxHeight: '80%' },
  tcModalTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 16 },
  tcModalText: { color: C.textSecondary, fontSize: 14, lineHeight: 22 },
  tcModalClose: { backgroundColor: C.primary, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  tcModalCloseText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
