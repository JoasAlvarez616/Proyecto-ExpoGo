import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './GlassCard';
import { AnimatedCounter } from './AnimatedCounter';
import { BorderRadius, Palette, Spacing, Typography } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';

interface MetricCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors?: readonly [string, string];
  onPress?: () => void;
  trend?: string;
  trendPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  isCurrency = false,
  subtitle,
  icon,
  gradientColors = [Palette.cyan400, Palette.cyan500] as const,
  onPress,
  trend,
  trendPositive = true,
}) => {
  const { colors } = useTheme();

  return (
    <GlassCard onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Ionicons name={icon} size={20} color={Palette.white} />
        </LinearGradient>

        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trendPositive
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(244, 63, 94, 0.15)',
              },
            ]}
          >
            <Ionicons
              name={trendPositive ? 'arrow-up' : 'arrow-down'}
              size={11}
              color={trendPositive ? Palette.emerald400 : Palette.rose400}
            />
            <Text
              style={[
                styles.trendText,
                { color: trendPositive ? Palette.emerald400 : Palette.rose400 },
              ]}
            >
              {trend}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: colors.textMuted }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.valueRow}>
        <AnimatedCounter
          value={value}
          isCurrency={isCurrency}
          style={styles.valueText}
        />
      </View>

      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  trendText: {
    ...Typography.captionBold,
    fontSize: 11,
  },
  title: {
    ...Typography.captionBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  valueRow: {
    marginBottom: 4,
  },
  valueText: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.caption,
    fontSize: 12,
  },
});

