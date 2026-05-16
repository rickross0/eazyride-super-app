// ============================================================
// EazyRide + Haye! — Onboarding Screen v2.3.0 (Theme-aware)
// ============================================================

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  { emoji: '🚗', title: 'Request a Ride', subtitle: 'Fast, affordable rides at your fingertips', description: 'Get from A to B with real-time tracking, upfront pricing, and trusted drivers.' },
  { emoji: '🍔', title: 'Order Food', subtitle: 'From your favorite restaurants', description: 'Browse menus, order with delivery or pickup, and track your meal in real time.' },
  { emoji: '🚙', title: 'Rent a Car', subtitle: 'Browse & book vehicles with deposit', description: 'Choose from a range of vehicles with secure deposit and escrow protection.' },
  { emoji: '🔧', title: 'Book Services', subtitle: 'Gas, water, carpentry, plumbing & more', description: 'Professional service providers at your doorstep. Schedule, track, and pay securely.' },
  { emoji: '🎁', title: 'Win Prizes', subtitle: 'Driver giveaways & promotions', description: 'Exclusive free promotional giveaways for our drivers. Rewards for the road.' },
];

export default function OnboardingScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
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

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentSlide && styles.activeDot]} />
          ))}
        </View>
        <TouchableOpacity onPress={handleNext}>
          <LinearGradient
            colors={[colors.primary || '#FFD700', colors.gold_dark || '#b8860b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, fontWeight: '600', color: C.primary, textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 15, color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
  footer: { paddingHorizontal: 32, paddingBottom: 40, alignItems: 'center' },
  dots: { flexDirection: 'row', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border, marginHorizontal: 4 },
  activeDot: { backgroundColor: C.primary, width: 20 },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
