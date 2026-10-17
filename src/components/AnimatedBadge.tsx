import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Palette, Spacing, Typography } from '../theme/tokens';
import { EstadoVenta } from '../types';

export type BadgeType = EstadoVenta | 'bajo_stock' | 'normal' | 'activo' | 'inactivo';

interface AnimatedBadgeProps {
  type: BadgeType;
  label?: string;
  size?: 'sm' | 'md';
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  type,
  label,
  size = 'md',
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'pagada':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.35)',
          color: Palette.emerald400,
          icon: 'checkmark-circle' as const,
          text: label || 'Pagada',
        };
      case 'pendiente':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.35)',
          color: Palette.amber400,
          icon: 'time' as const,
          text: label || 'Pendiente',
        };
      case 'anulada':
        return {
          bg: 'rgba(244, 63, 94, 0.15)',
          border: 'rgba(244, 63, 94, 0.35)',
          color: Palette.rose400,
          icon: 'close-circle' as const,
          text: label || 'Anulada',
        };
      case 'bajo_stock':
        return {
          bg: 'rgba(245, 158, 11, 0.18)',
          border: 'rgba(245, 158, 11, 0.45)',
          color: Palette.amber400,
          icon: 'alert-circle' as const,
          text: label || 'Bajo Stock',
        };
      case 'activo':
        return {
          bg: 'rgba(34, 211, 238, 0.15)',
          border: 'rgba(34, 211, 238, 0.35)',
          color: Palette.cyan400,
          icon: 'ellipse' as const,
          text: label || 'Activo',
        };
      case 'inactivo':
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.15)',
          border: 'rgba(148, 163, 184, 0.3)',
          color: Palette.slate400,
          icon: 'remove-circle' as const,
          text: label || 'Normal',
        };
    }
  };

  const config = getBadgeConfig();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 7 : 10,
        },
      ]}
    >
      <Ionicons
        name={config.icon}
        size={isSmall ? 11 : 13}
        color={config.color}
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: isSmall ? 11 : 12,
          },
        ]}
      >
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    ...Typography.captionBold,
    textTransform: 'capitalize',
  },
});

