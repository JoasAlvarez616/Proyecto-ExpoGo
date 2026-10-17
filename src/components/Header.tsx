import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, Spacing, Typography } from '../theme/tokens';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
  };
  showThemeToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  showThemeToggle = true,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const themeScale = useSharedValue(1);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleToggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    themeScale.value = withSpring(0.7, { damping: 10 }, () => {
      themeScale.value = withSpring(1);
    });
    toggleTheme();
  };

  const animatedThemeIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: themeScale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topRow}>
        <View style={styles.leftContainer}>
          {showBack && (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                pressed && { opacity: 0.7 },
              ]}
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </Pressable>
          )}

          <View style={styles.titleWrapper}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.rightActions}>
          {rightAction && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                rightAction.onPress();
              }}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                pressed && { opacity: 0.7 },
              ]}
              hitSlop={8}
            >
              <Ionicons
                name={rightAction.icon}
                size={20}
                color={rightAction.color || colors.accentCyan}
              />
            </Pressable>
          )}

          {showThemeToggle && (
            <Pressable
              onPress={handleToggleTheme}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                pressed && { opacity: 0.7 },
              ]}
              hitSlop={8}
            >
              <Animated.View style={animatedThemeIconStyle}>
                <Ionicons
                  name={isDark ? 'sunny' : 'moon'}
                  size={19}
                  color={isDark ? '#FBBF24' : colors.accentViolet}
                />
              </Animated.View>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    ...Typography.title1,
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

