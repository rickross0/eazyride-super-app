import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../contexts/ThemeContext';

export const SuccessAnimation = ({ onAnimationFinish, size = 200 }) => (
  <View style={styles.center}>
    <LottieView
      source={require('../assets/animations/success.json')}
      autoPlay
      loop={false}
      onAnimationFinish={onAnimationFinish}
      style={{ width: size, height: size }}
    />
  </View>
);

export const LoadingAnimation = ({ size = 150 }) => (
  <View style={styles.center}>
    <LottieView
      source={require('../assets/animations/loading.json')}
      autoPlay
      loop
      style={{ width: size, height: size }}
    />
  </View>
);

export const EmptyStateAnimation = ({ size = 200 }) => (
  <View style={styles.center}>
    <LottieView
      source={require('../assets/animations/empty.json')}
      autoPlay
      loop
      style={{ width: size, height: size }}
    />
  </View>
);

export const LoadingFallback = ({ text = 'Loading...' }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text style={[styles.loadingText, { color: colors.text }]} >{text}</Text>
    </View>
  );
};

export const EmptyFallback = ({ text = 'Nothing here yet.' }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]} >{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
});
