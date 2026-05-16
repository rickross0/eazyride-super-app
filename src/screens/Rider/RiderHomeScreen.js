import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, Pressable,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../theme/premiumDesignTokens';

export default function RiderHomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const actions = [
    { id: 1, icon: 'navigation', label: 'Book a Ride', color: colors.primary || '#FFD700', screen: 'RideRequest' },
    { id: 2, icon: 'coffee', label: 'Order Food', color: colors.textSecondary || '#c0c0c0', screen: 'Stores' },
    { id: 3, icon: 'key', label: 'Rent a Car', color: colors.danger || '#dc2626', screen: 'CarRental' },
    { id: 4, icon: 'settings', label: 'Services', color: colors.gold_light || '#e8c547', screen: 'ServiceCategories' },
    { id: 5, icon: 'credit-card', label: 'Wallet', color: colors.silver_dark || '#808080', screen: 'Wallet' },
    { id: 6, icon: 'clock', label: 'History', color: colors.red_dark || '#991b1b', screen: 'History' },
  ];

  const handleActionPress = (screen) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(screen);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#0a0a0a' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <LinearGradient
        colors={colors.background === '#0a0a0a' ? [colors.gold_dark || '#b8860b', colors.background] : [colors.primary || '#daa520', colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <Animated.View entering={FadeInUp.duration(600).delay(100)}>
          <Text style={[styles.greeting, { color: colors.text_primary || colors.text }]} >
            Welcome Back, {user?.firstName || 'Rider'}!
          </Text>
          <Text style={[styles.subGreeting, { color: colors.text_secondary || colors.textSecondary }]} >
            Ready for your next adventure?
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.statusCard}>
          <View style={styles.statusContent}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: colors.success || '#10b981' }]} />
              <Text style={[styles.statusText, { color: colors.text_primary || colors.text }]} >Account Active</Text>
            </View>
            <Text style={[styles.statusValue, { color: colors.primary || colors.gold }]} >4.9★ Rating</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        <View style={styles.gridContainer}>
          {actions.map((action, index) => (
            <Animated.View
              key={action.id}
              entering={FadeInUp.duration(400).delay(200 + index * 100)}
              style={styles.actionCard}
            >
              <Pressable
                onPress={() => handleActionPress(action.screen)}
                style={({ pressed }) => [
                  styles.actionCardPressable,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <LinearGradient
                  colors={[action.color, action.color + '99']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionCardGradient}
                >
                  <View style={styles.actionCardInner}>
                    <View style={[styles.iconWrapper, { backgroundColor: colors.white_transparent || 'rgba(255,255,255,0.1)' }]}>
                      <Feather name={action.icon} size={28} color={colors.white || '#fff'} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.duration(400).delay(900)}>
          <LinearGradient
            colors={colors.background === '#0a0a0a' ? [colors.gold_dark || '#b8860b', colors.red_dark || '#991b1b'] : [colors.primary || '#daa520', colors.danger || '#dc2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoBanner}
          >
            <Text style={styles.promoTitle}>Special Offer!</Text>
            <Text style={styles.promoText}>Get 20% off your next ride. Use code: WELCOME20</Text>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: {
    paddingTop: SPACING.xxl + 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
  },
  subGreeting: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.xs,
  },
  statusCard: {
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  statusText: {
    ...TYPOGRAPHY.body_small,
  },
  statusValue: {
    ...TYPOGRAPHY.body_small,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: SPACING.lg,
  },
  actionCardPressable: {
    flex: 1,
  },
  actionCardGradient: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 140,
    justifyContent: 'center',
  },
  actionCardInner: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  actionLabel: {
    ...TYPOGRAPHY.body_small,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  promoBanner: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginVertical: SPACING.xl,
  },
  promoTitle: {
    ...TYPOGRAPHY.h3,
    color: '#ffffff',
    marginBottom: SPACING.sm,
  },
  promoText: {
    ...TYPOGRAPHY.body_small,
    color: 'rgba(255,255,255,0.8)',
  },
});
