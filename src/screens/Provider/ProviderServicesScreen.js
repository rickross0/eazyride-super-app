import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import client from '../../api/client';

export default function ProviderServicesScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const navigation = useNavigation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setError(null);
    try {
      const { data } = await client.get('/providers/my/profile');
      setProfile(data?.data?.profile || data?.data || data?.profile || null);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load provider profile';
      setError(msg);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const { data } = await client.patch('/providers/toggle-availability');
      setProfile((prev) => (prev ? { ...prev, isAvailable: data.isAvailable } : prev));
      Alert.alert('Success', `You are now ${data.isAvailable ? 'Available' : 'Not Available'}`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to toggle availability');
    } finally {
      setToggling(false);
    }
  };

  const isAvailable = profile?.isAvailable ?? false;
  const isApproved = profile?.isApproved ?? false;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Services</Text>
      </View>

      {loading && !profile ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : error && !profile ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.profileCard}>
            <Text style={styles.businessName}>{profile?.businessName || 'Your Business'}</Text>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isApproved ? '#4CAF50' : colors.danger },
                ]}
              >
                <Text style={styles.badgeText}>{isApproved ? 'Approved' : 'Pending'}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#C0C0C0' }]}>
                <Text style={styles.badgeText}>{profile?.category || 'General'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Commission Rate</Text>
              <Text style={styles.infoValue}>
                {profile?.commissionRate != null ? `${profile.commissionRate}%` : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                { backgroundColor: isAvailable ? '#4CAF50' : colors.danger },
              ]}
              onPress={toggleAvailability}
              disabled={toggling}
            >
              {toggling ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.toggleBtnText}>
                  {isAvailable ? '✅ Available' : '⛔ Not Available'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Total Requests</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>5.0</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (C) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12 },
    backBtn: { marginBottom: 8 },
    backText: { color: C.primary, fontSize: 16, fontWeight: '600' },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#000000', marginTop: 4 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    loadingText: { marginTop: 12, color: C.textSecondary, fontSize: 15, fontWeight: '600' },
    errorText: { color: '#FF0000', fontSize: 15, textAlign: 'center', marginBottom: 16 },
    retryBtn: { backgroundColor: C.primary, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
    retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    profileCard: {
      backgroundColor: C.card,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginBottom: 16,
      borderTopWidth: 4,
      borderTopColor: C.primary,
      elevation: 2,
      shadowColor: '#000000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    businessName: { fontSize: 22, fontWeight: '800', color: '#000000', marginBottom: 12 },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
    badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#C0C0C0',
    },
    infoLabel: { fontSize: 15, color: C.textSecondary, fontWeight: '600' },
    infoValue: { fontSize: 15, color: C.text, fontWeight: '700' },
    section: { marginHorizontal: 16, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000000', marginBottom: 12 },
    toggleBtn: { borderRadius: 14, padding: 16, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    toggleBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    statCard: {
      flex: 1,
      backgroundColor: C.card,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      elevation: 2,
      borderWidth: 1,
      borderColor: '#C0C0C0',
    },
    statValue: { fontSize: 22, fontWeight: '800', color: C.primary, marginBottom: 4 },
    statLabel: { fontSize: 12, color: C.textSecondary, fontWeight: '600', textAlign: 'center' },
  });
