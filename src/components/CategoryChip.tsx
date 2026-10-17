import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, Palette, Spacing, Typography } from '../theme/tokens';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  selected,
  onPress,
  count,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.92, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? 'rgba(34, 211, 238, 0.18)'
            : colors.surface,
          borderColor: selected ? Palette.cyan400 : colors.cardBorder,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected ? Palette.cyan400 : colors.textSecondary,
            fontWeight: selected ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
      {count !== undefined && (
        <Text
          style={[
            styles.countBadge,
            {
              backgroundColor: selected ? Palette.cyan400 : colors.surfaceSecondary,
              color: selected ? Palette.slate900 : colors.textMuted,
            },
          ]}
        >
          {count}
        </Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  label: {
    ...Typography.captionBold,
  },
  countBadge: {
    ...Typography.captionBold,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.round,
    marginLeft: 6,
    overflow: 'hidden',
  },
});

