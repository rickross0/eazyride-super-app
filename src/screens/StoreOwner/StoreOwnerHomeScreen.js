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

export default function StoreOwnerHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, rating: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const cfg = ROLE_CONFIG.STORE_OWNER;

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/orders/store');
      const orders = data?.orders || data?.data?.orders || [];
      const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      setStats({ orders: orders.length, revenue, products: 0, rating: 0 });
    } catch {}
  };

  useEffect(() => { fetchStats(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const actions = [
    { icon: 'package', label: 'Inventory', screen: 'Inventory' },
    { icon: 'shopping-cart', label: 'Orders', screen: 'Orders' },
    { icon: 'star', label: 'Reviews', screen: 'Home' },
    { icon: 'dollar-sign', label: 'Earnings', screen: 'Home' },
  ];

  const statItems = [
    { label: 'Orders', value: stats.orders, icon: 'shopping-cart' },
    { label: 'Revenue', value: `$${(stats.revenue || 0).toFixed(2)}`, icon: 'dollar-sign' },
    { label: 'Products', value: stats.products, icon: 'package' },
    { label: 'Rating', value: (stats.rating || 0).toFixed(1), icon: 'star' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={cfg.color} />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={cfg.color} />}
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
                Hi, {user?.firstName || 'Store Owner'} 🏪
              </Text>
            </Animated.View>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          {statItems.map((s, index) => (
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
          <Text style={[styles.sectionTitle, { color: colors.text_primary || colors.text }]} >Quick Actions</Text>
          <View style={styles.grid}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.actionCard, { backgroundColor: colors.surface || colors.card }, SHADOWS.small]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate(action.screen); }}
              >
                <Feather name={action.icon} size={28} color={cfg.color} />
                <Text style={[styles.actionLabel, { color: colors.text_primary || colors.text }]} >{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  header: { paddingBottom: SPACING.sm },
  greeting: { ...TYPOGRAPHY.h3 },
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
  statValue: { ...TYPOGRAPHY.h4, marginTop: SPACING.sm },
  statLabel: { ...TYPOGRAPHY.caption, marginTop: SPACING.xs },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: { ...TYPOGRAPHY.h4, marginBottom: SPACING.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  actionLabel: {
    ...TYPOGRAPHY.body_small,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
});
