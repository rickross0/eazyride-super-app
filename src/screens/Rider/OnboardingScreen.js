// ============================================================
// EazyRide + Haye! — Onboarding Screen v2.2.0
// ============================================================

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  { emoji: '🚗', title: 'Request a Ride', subtitle: 'Fast, affordable rides at your fingertips', description: 'Get from A to B with real-time tracking, upfront pricing, and trusted drivers.' },
  { emoji: '🍔', title: 'Order Food', subtitle: 'From your favorite restaurants', description: 'Browse menus, order with delivery or pickup, and track your meal in real time.' },
  { emoji: '🚙', title: 'Rent a Car', subtitle: 'Browse & book vehicles with deposit', description: 'Choose from a range of vehicles with secure deposit and escrow protection.' },
  { emoji: '🔧', title: 'Book Services', subtitle: 'Gas, water, carpentry, plumbing & more', description: 'Professional service providers at your doorstep. Schedule, track, and pay securely.' },
  { emoji: '🎰', title: 'Win Prizes', subtitle: 'Daily lottery with every purchase', description: 'Earn tickets with rides and orders. Daily draws with real cash prizes.' },
];

export default function OnboardingScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SCREEN_WIDTH);
    setCurrentSlide(idx);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentSlide + 1) * SCREEN_WIDTH, animated: true });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => { navigation.replace('Login'); };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
        {slides.map((slide, i) => (
          <View key={i} style={styles.slide}>
            <Text style={styles.slideEmoji}>{slide.emoji}</Text>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]} />
        ))}
      </View>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  skipButton: { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 8 },
  skipText: { ...typography.body2, color: colors.gray[500], fontWeight: '600' },
  slide: { width: SCREEN_WIDTH, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  slideEmoji: { fontSize: 72, marginBottom: 24 },
  slideTitle: { ...typography.h2, color: colors.gray[900], textAlign: 'center', marginBottom: 8 },
  slideSubtitle: { ...typography.h5, color: colors.primary[400], textAlign: 'center', marginBottom: 16 },
  slideDescription: { ...typography.body1, color: colors.gray[500], textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray[300], marginHorizontal: 4 },
  dotActive: { backgroundColor: colors.primary[400], width: 24, borderRadius: 4 },
  nextButton: { marginHorizontal: 32, marginBottom: 48, backgroundColor: colors.primary[400], borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { ...typography.button, color: '#FFFFFF' },
});
