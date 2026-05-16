/**
 * NOTE: A reusable, animated skeleton loader component.
 * This provides a much better user experience than a simple loading spinner by
 * showing a preview of the content's shape. The shimmer animation, created with
 * `react-native-reanimated`, gives the app a premium, modern feel.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

const AnimatedSkeleton = ({ width, height, borderRadius = 8, style }) => {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-width * 1.5, width * 1.5]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        { width, height, borderRadius, backgroundColor: colors.border, overflow: 'hidden' },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            width: '150%',
            height: '100%',
            backgroundColor: colors.card,
            opacity: 0.3,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export default AnimatedSkeleton;
