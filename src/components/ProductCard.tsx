import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { AnimatedBadge } from './AnimatedBadge';
import { Producto } from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateProfitMargin } from '../utils/calculations';
import { BorderRadius, Palette, Spacing, Typography } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';

interface ProductCardProps {
  producto: Producto;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ producto, onPress }) => {
  const { colors } = useTheme();
  const isLowStock = producto.stock <= producto.stock_minimo;
  const { margenPorcentaje } = calculateProfitMargin(
    producto.precio_compra,
    producto.precio_venta
  );

  return (
    <GlassCard onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.categoryBadge}>
          <Text style={[styles.categoryText, { color: colors.accentCyan }]}>
            {producto.categoria_nombre || 'General'}
          </Text>
        </View>

        {isLowStock ? (
          <AnimatedBadge type="bajo_stock" label={`Bajo: ${producto.stock} uds`} size="sm" />
        ) : (
          <View style={[styles.stockPill, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="cube-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.stockText, { color: colors.textSecondary }]}>
              {producto.stock} en stock
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={2}>
        {producto.nombre}
      </Text>

      {producto.descripcion ? (
        <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={1}>
          {producto.descripcion}
        </Text>
      ) : null}

      <View style={[styles.footerRow, { borderTopColor: colors.divider }]}>
        <View>
          <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Precio Venta</Text>
          <Text style={[styles.priceValue, { color: colors.textPrimary }]}>
            {formatCurrency(producto.precio_venta)}
          </Text>
        </View>

        <View style={styles.profitBadge}>
          <Ionicons name="trending-up" size={13} color={Palette.emerald400} />
          <Text style={styles.profitText}>+{margenPorcentaje}%</Text>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
  },
  categoryText: {
    ...Typography.captionBold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  stockText: {
    ...Typography.caption,
    fontSize: 11,
  },
  name: {
    ...Typography.title3,
    marginBottom: 4,
  },
  description: {
    ...Typography.caption,
    marginBottom: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  priceLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  priceValue: {
    ...Typography.title2,
    fontWeight: '800',
  },
  profitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  profitText: {
    ...Typography.captionBold,
    color: Palette.emerald400,
    fontSize: 11,
  },
});

