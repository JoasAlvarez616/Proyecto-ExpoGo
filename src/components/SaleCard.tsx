import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { AnimatedBadge } from './AnimatedBadge';
import { Venta } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Spacing, Typography } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';

interface SaleCardProps {
  venta: Venta;
  onPress: () => void;
}

export const SaleCard: React.FC<SaleCardProps> = ({ venta, onPress }) => {
  const { colors } = useTheme();

  return (
    <GlassCard onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.idContainer}>
          <Text style={[styles.idText, { color: colors.accentCyan }]}>
            #{venta.id.toString().padStart(4, '0')}
          </Text>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {formatDate(venta.fecha)}
          </Text>
        </View>

        <AnimatedBadge type={venta.estado} size="sm" />
      </View>

      <View style={styles.clientRow}>
        <Ionicons name="person-circle-outline" size={18} color={colors.accentViolet} />
        <Text style={[styles.clientName, { color: colors.textPrimary }]} numberOfLines={1}>
          {venta.cliente_nombre || 'Cliente General'}
        </Text>
      </View>

      <View style={[styles.bottomRow, { borderTopColor: colors.divider }]}>
        <View style={styles.itemsCountContainer}>
          <Ionicons name="cart-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.itemsText, { color: colors.textMuted }]}>
            {venta.items_count || 1} {venta.items_count === 1 ? 'ítem' : 'ítems'}
          </Text>
        </View>

        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total Facturado</Text>
          <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>
            {formatCurrency(venta.total)}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  idContainer: {
    flexDirection: 'column',
  },
  idText: {
    ...Typography.mono,
    fontWeight: '700',
    fontSize: 15,
  },
  dateText: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  clientName: {
    ...Typography.bodyBold,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  itemsCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemsText: {
    ...Typography.caption,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    ...Typography.caption,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  totalAmount: {
    ...Typography.title2,
    fontWeight: '800',
  },
});

