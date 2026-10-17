import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BorderRadius, Gradients, Palette, Shadows, Spacing, Typography } from '../theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  hapticFeedback?: Haptics.ImpactFeedbackStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  hapticFeedback = Haptics.ImpactFeedbackStyle.Medium,
}) => {
  const scale = useSharedValue(1);

  const getGradientColors = () => {
    switch (variant) {
      case 'secondary':
        return Gradients.violetSecondary;
      case 'success':
        return Gradients.emeraldSuccess;
      case 'danger':
        return Gradients.roseDanger;
      case 'ghost':
        return ['transparent', 'transparent'] as const;
      case 'primary':
      default:
        return Gradients.cyanPrimary;
    }
  };

  const getShadow = () => {
    if (disabled || variant === 'ghost') return {};
    switch (variant) {
      case 'secondary':
        return Shadows.glowViolet;
      case 'success':
        return Shadows.glowEmerald;
      case 'primary':
      default:
        return Shadows.glowCyan;
    }
  };

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, { damping: 15, stiffness: 350 });
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 350 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(hapticFeedback);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const colors = getGradientColors();

  return (
    <AnimatedPressable
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.container, getShadow(), animatedStyle, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={disabled ? [Palette.slate700, Palette.slate800] : (colors as any)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          variant === 'ghost' && styles.ghostBorder,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Palette.white} size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon && iconPosition === 'left' && (
              <Ionicons
                name={icon}
                size={18}
                color={variant === 'ghost' ? Palette.cyan400 : Palette.white}
                style={styles.iconLeft}
              />
            )}
            <Text
              style={[
                styles.text,
                variant === 'ghost' && { color: Palette.cyan400 },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons
                name={icon}
                size={18}
                color={variant === 'ghost' ? Palette.cyan400 : Palette.white}
                style={styles.iconRight}
              />
            )}
          </View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.bodyBold,
    color: Palette.white,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  ghostBorder: {
    borderWidth: 1.5,
    borderColor: Palette.cyan400,
  },
});

