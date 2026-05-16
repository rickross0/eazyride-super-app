// ============================================================
// EazyRide + Haye! — Splash Screen v2.2.0
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography } from '../../theme/designTokens';

export default function SplashScreen({ navigation }) {
  const { user, loading } = useAuth();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        navigation.replace(user ? 'Main' : 'Onboarding');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.logoEmoji}>🚗</Text>
        <Text style={styles.logoText}>EazyRide</Text>
        <Text style={styles.logoSubtext}>+ Haye!</Text>
      </Animated.View>
      <View style={styles.taglineContainer}>
        <Text style={styles.tagline}>Fast & Safe</Text>
        <Text style={styles.version}>v2.2.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary[400], justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center' },
  logoEmoji: { fontSize: 72, marginBottom: 8 },
  logoText: { ...typography.h1, color: '#FFFFFF', fontWeight: '800' },
  logoSubtext: { ...typography.h4, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  taglineContainer: { position: 'absolute', bottom: 80, alignItems: 'center' },
  tagline: { ...typography.body1, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  version: { ...typography.caption, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
});
