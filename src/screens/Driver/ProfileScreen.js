import { useThemedStyles, useTheme } from '../../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert, Image, Linking } from 'react-native';
import { Modal } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import client from '../../api/client';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState({ phone: '', whatsapp: '', email: '' });
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [canDeliver, setCanDeliver] = useState(false);
  const [togglingDelivery, setTogglingDelivery] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const [tcContent, setTcContent] = useState('');
  const [showTcModal, setShowTcModal] = useState(false);

  useEffect(() => {
    fetchProfile();
    (async () => {
      try {
        const { data } = await client.get('/support/contacts');
        setContacts({ phone: data.phone || '', whatsapp: data.whatsapp || '', email: data.email || '' });
      } catch {}
    })();
  }, []);

  const showTerms = async () => {
    try {
      const { data } = await client.get('/legal/terms');
      setTcContent(data.content);
    } catch { setTcContent('Unable to load Terms & Conditions.'); }
    setShowTcModal(true);
  };

  const fetchProfile = async () => {
    try {
      const { data } = await client.get('/drivers/profile');
      setProfile(data.profile);
      setCanDeliver(data.profile?.canDeliver || false);
    } catch (e) {
      console.error('Profile fetch error:', e);
    } finally {
      setRefreshing(false);
    }
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

  const onRefresh = () => { setRefreshing(true); fetchProfile(); };

  const toggleCanDeliver = async () => {
    const newValue = !canDeliver;
    setTogglingDelivery(true);
    try {
      await client.put('/drivers/profile', { canDeliver: newValue });
      setCanDeliver(newValue);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to update');
      setCanDeliver(canDeliver);
    } finally {
      setTogglingDelivery(false);
    }
  };

  const approvalBadge = (isApproved) => {
    if (isApproved === true) return { text: 'Approved', color: COLORS.success };
    if (isApproved === false) return { text: 'Pending', color: COLORS.warning };
    return { text: 'Unknown', color: COLORS.textSecondary };
  };

  const formatDate = (dateStr) => {
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return '—'; }
  };

  const badge = approvalBadge(profile?.isApproved);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
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
        <Text style={styles.role}>{user?.role}</Text>
      </View>

      {profile && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Driver Info</Text>

          <View style={styles.statusRow}>
            <Text style={styles.label}>Approval Status</Text>
            <Text style={[styles.badge, { color: badge.color }]}>{badge.text}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Vehicle Type</Text>
            <Text style={styles.value}>{profile.vehicleType || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Plate Number</Text>
            <Text style={styles.value}>{profile.plateNumber || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>License Number</Text>
            <Text style={styles.value}>{profile.licenseNumber || '—'}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.totalRides ?? 0}</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
          </View>

          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>Available for Delivery</Text>
            <TouchableOpacity style={[styles.toggle, { backgroundColor: canDeliver ? COLORS.primary : COLORS.border }]} onPress={toggleCanDeliver} disabled={togglingDelivery} activeOpacity={0.8}>
              <View style={[styles.toggleThumb, { marginLeft: canDeliver ? 22 : 2 }]} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.payoutBtn} onPress={() => navigation?.navigate('Earnings')}>
        <Text style={styles.payoutText}>💰 Earnings & Payout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.vehicleBtn} onPress={() => navigation?.navigate('VehicleInfo')}>
        <Text style={styles.payoutText}>🚗 Vehicle Details</Text>
      </TouchableOpacity>

      <View style={styles.themeRow}>
        <Text style={styles.themeLabel}>Light</Text>
        <TouchableOpacity style={[styles.toggle, { backgroundColor: isDark ? COLORS.primary : COLORS.border }]} onPress={toggleTheme} activeOpacity={0.8}>
          <View style={[styles.toggleThumb, { marginLeft: isDark ? 22 : 2 }]} />
        </TouchableOpacity>
        <Text style={styles.themeLabel}>Dark</Text>
      </View>

      {(contacts.phone || contacts.whatsapp || contacts.email) ? (
        <View style={styles.contactSectionHeader}>
          <Text style={styles.contactSectionTitle}>📞 Contact Care</Text>
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
  card: { backgroundColor: C.card, borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 12, alignSelf: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderText: { color: '#FFF', fontSize: 28, fontWeight: '700' },
  avatarBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: C.primary, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.card },
  avatarBadgeText: { fontSize: 10 },
  name: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
  phone: { fontSize: 16, color: C.textSecondary, marginBottom: 4 },
  memberSince: { fontSize: 13, color: C.textSecondary, fontStyle: 'italic', marginTop: 4 },
  role: { fontSize: 14, color: C.primary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 14 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { color: C.textSecondary, fontSize: 14 },
  value: { color: C.text, fontSize: 14, fontWeight: '600' },
  badge: { fontSize: 14, fontWeight: '800' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border },
  deliveryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border },
  deliveryLabel: { color: C.text, fontSize: 15, fontWeight: '600' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: C.textSecondary, fontSize: 12 },
  payoutBtn: { backgroundColor: C.card, borderWidth: 1, borderColor: C.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  vehicleBtn: { backgroundColor: C.card, borderWidth: 1, borderColor: C.warning, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  payoutText: { color: C.primary, fontWeight: '700', fontSize: 16 },
  tcRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.primary, borderRadius: 12, padding: 16, marginBottom: 12 },
  tcRowEmoji: { fontSize: 20, marginRight: 12 },
  tcRowText: { color: C.primary, fontWeight: '700', fontSize: 16 },
  tcModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  tcModalContent: { backgroundColor: C.card, borderRadius: 16, padding: 20, maxHeight: '80%' },
  tcModalTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 16 },
  tcModalText: { color: C.textSecondary, fontSize: 14, lineHeight: 22 },
  tcModalClose: { backgroundColor: C.primary, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  tcModalCloseText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  contactSectionHeader: { marginBottom: 8 },
  contactSectionTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  contactBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8 },
  contactEmoji: { fontSize: 22, marginRight: 12 },
  contactLabel: { color: C.text, fontSize: 16, fontWeight: '600' },
  logoutBtn: { backgroundColor: C.danger, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 40 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16 },
  themeLabel: { color: C.textSecondary, fontSize: 14 },
  toggle: { width: 48, height: 28, borderRadius: 14, justifyContent: 'center' },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2 },
  logoutText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
