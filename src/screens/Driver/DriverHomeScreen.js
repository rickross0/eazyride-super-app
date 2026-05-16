import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ROLE_CONFIG } from '../../config';
import api from '../../api/client';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../theme/premiumDesignTokens';

export default function DriverHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [online, setOnline] = useState(false);
  const [rides, setRides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const cfg = ROLE_CONFIG.DRIVER;

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/drivers/rides');
      const list = data?.data || data || [];
      setRides(list);
    } catch {}
  };

  useEffect(() => { fetchRides(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRides();
    setRefreshing(false);
  };

  const toggleOnline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOnline(prev => !prev);
  };

  const today = new Date().toDateString();
  const todayRides = rides.filter(r => r.completedAt && new Date(r.completedAt).toDateString() === today);

  const stats = [
    { label: 'Today', value: todayRides.length, icon: 'check-circle' },
    { label: 'Earnings', value: `$${todayRides.reduce((s, r) => s + (r.driverEarnings || r.fare || 0), 0).toFixed(2)}`, icon: 'dollar-sign' },
    { label: 'Rating', value: user?.rating?.toFixed(1) || '4.5', icon: 'star' },
    { label: 'Rides', value: rides.length, icon: 'truck' },
  ];

  const activeRides = rides.filter(r =>
    r.status === 'IN_PROGRESS' || r.status === 'DRIVER_ASSIGNED' || r.status === 'ACCEPTED'
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#0a0a0a' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <LinearGradient
          colors={[cfg.color, colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.header}>
            <Animated.View entering={FadeInUp.duration(600).delay(100)}>
              <Text style={[styles.greeting, { color: '#ffffff' }]} >
                Hi, {user?.firstName || 'Driver'} 👋
              </Text>
            </Animated.View>
            <TouchableOpacity
              style={[styles.onlineBtn, { backgroundColor: online ? '#10b981' : colors.red || '#dc2626' }]}
              onPress={toggleOnline}
            >
              <Text style={styles.onlineBtnText}>
                {online ? '● Online' : '○ Offline'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          {stats.map((s, index) => (
            <Animated.View
              key={s.label}
              entering={FadeInUp.duration(400).delay(200 + index * 100)}
              style={[styles.statCard, { backgroundColor: colors.surface || colors.card }, SHADOWS.small]}
            >
              <Feather name={s.icon} size={22} color={cfg.color} />
              <Text style={[styles.statValue, { color: colors.text_primary || colors.text }]} >{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.text_tertiary || colors.textSecondary }]} >{s.label}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text_primary || colors.text }]} >Active Ride</Text>
          {activeRides.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface || colors.card }]} >
              <Feather name="map" size={36} color={colors.text_tertiary || colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text_primary || colors.text }]} >No active ride</Text>
              <Text style={[styles.emptySubtext, { color: colors.text_tertiary || colors.textSecondary }]} >Go online to start receiving rides</Text>
            </View>
          ) : (
            activeRides.map(ride => (
              <TouchableOpacity
                key={ride.id}
                style={[styles.rideCard, { backgroundColor: colors.surface || colors.card }, SHADOWS.small]}
                onPress={() => navigation.navigate('ActiveRide', { rideId: ride.id, ride })}
              >
                <Text style={[styles.rideRoute, { color: colors.text_primary || colors.text }]} >
                  {ride.pickup?.address || ride.pickup} → {ride.destination?.address || ride.destination}
                </Text>
                <Text style={[styles.rideFare, { color: colors.success || '#10b981' }]} >
                  ${(ride.fare || 0).toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text_primary || colors.text }]} >Recent Rides</Text>
          {rides.slice(0, 5).map(ride => (
            <View key={ride.id} style={[styles.rideItem, { backgroundColor: colors.surface || colors.card }]} >
              <Text style={[styles.rideRouteSmall, { color: colors.text_primary || colors.text }]} >
                {ride.pickup?.address || ride.pickup} → {ride.destination?.address || ride.destination}
              </Text>
              <Text style={[styles.rideStatus, { color: colors.text_tertiary || colors.textSecondary }]} >
                {ride.status}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  heroSection: {
    paddingTop: SPACING.xxl + 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...TYPOGRAPHY.h3,
  },
  onlineBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  onlineBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
  },
  statCard: {
    width: '47%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h4,
    marginTop: SPACING.sm,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xs,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    marginBottom: SPACING.md,
  },
  emptyCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body_small,
    marginTop: SPACING.xs,
  },
  rideCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  rideRoute: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  rideFare: {
    ...TYPOGRAPHY.body_small,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  rideItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rideRouteSmall: {
    ...TYPOGRAPHY.body_small,
    flex: 1,
  },
  rideStatus: {
    ...TYPOGRAPHY.caption,
    textTransform: 'capitalize',
  },
});
