import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, BORDER_RADIUS } from '../theme/premiumDesignTokens';

const AnimatedButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const getColors = () => {
    switch (variant) {
      case 'secondary': return [colors.textSecondary || '#888', colors.border || '#ccc'];
      case 'danger': return ['#991b1b', '#dc2626'];
      case 'primary':
      default: return ['#b8860b', '#daa520'];
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small': return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
      case 'medium': return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg };
      case 'large':
      default: return { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl };
    }
  };

  const handlePressIn = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(0.92, { damping: 10, mass: 1, overshootClamping: true });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 10, mass: 1, overshootClamping: true });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
      >
        <LinearGradient
          colors={getColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, getSizeStyle(), { borderRadius: BORDER_RADIUS.lg }]}
        >
          <Animated.Text style={[styles.text, { fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18 }, textStyle]}>
            {title}
          </Animated.Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});

export default AnimatedButton;
