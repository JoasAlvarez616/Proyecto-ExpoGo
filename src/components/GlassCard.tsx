import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, Shadows, Spacing } from '../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  activeScale?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  onLongPress,
  disabled = false,
  activeScale = 0.98,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled || (!onPress && !onLongPress)) return;
    scale.value = withSpring(activeScale, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    if (disabled || (!onPress && !onLongPress)) return;
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePress = () => {
    if (disabled || !onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={disabled || (!onPress && !onLongPress)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
        },
        Shadows.subtle,
        animatedStyle,
        style,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg, // 20px
    borderWidth: 1,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
});

