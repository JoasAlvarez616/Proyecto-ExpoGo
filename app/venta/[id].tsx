import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VentaService } from '../../src/services/VentaService';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/Header';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedBadge } from '../../src/components/AnimatedBadge';
import { GradientButton } from '../../src/components/GradientButton';
import { ConfirmModal } from '../../src/components/ConfirmModal';
import { formatCurrency, formatDate } from '../../src/utils/formatters';
import { VentaConDetalles } from '../../src/types';
import { BorderRadius, Palette, Spacing, Typography } from '../../src/theme/tokens';

export default function DetalleVentaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [venta, setVenta] = useState<VentaConDetalles | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalAnularVisible, setModalAnularVisible] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const cargarVenta = () => {
    if (!id) return;
    const ventaId = parseInt(id, 10);
    const data = VentaService.getById(ventaId);
    setVenta(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarVenta();
  }, [id]);

  const handleAnular = async () => {
    if (!venta) return;
    try {
      setLoadingAction(true);
      VentaService.anularVenta(venta.id, 'admin', 'Cancelación solicitada por usuario');
      setModalAnularVisible(false);
      cargarVenta();
    } catch (err) {
      console.error('Error al anular venta:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePagar = () => {
    if (!venta) return;
    try {
      setLoadingAction(true);
      VentaService.pagarVenta(venta.id);
      cargarVenta();
    } catch (err) {
      console.error('Error al pagar venta:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Detalle de Factura" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
        </View>
      </SafeAreaView>
    );
  }

  if (!venta) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Factura no encontrada" showBack />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Palette.rose400} />
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            La factura consultada no existe.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title={`Factura #${venta.id.toString().padStart(4, '0')}`}
        subtitle={formatDate(venta.fecha)}
        showBack
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner de Estado */}
        <GlassCard style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={[styles.statusLabel, { color: colors.textMuted }]}>
                Estado de la Factura
              </Text>
              <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                {venta.estado.toUpperCase()}
              </Text>
            </View>
            <AnimatedBadge type={venta.estado} size="md" />
          </View>

          {venta.estado === 'anulada' && (
            <View style={styles.anuladaNotice}>
              <Ionicons name="information-circle" size={16} color={Palette.rose400} />
              <Text style={styles.anuladaNoticeText}>
                Esta transacción fue anulada. Las existencias de los artículos fueron reintegradas automáticamente al inventario activo.
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Información del Cliente */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Cliente Emisor
        </Text>
        <GlassCard style={styles.card}>
          <View style={styles.clientRow}>
            <View style={styles.clientAvatar}>
              <Ionicons name="person" size={20} color={colors.accentCyan} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.clientName, { color: colors.textPrimary }]}>
                {venta.cliente?.nombre || venta.cliente_nombre || 'Cliente General'}
              </Text>
              <Text style={[styles.clientSub, { color: colors.textMuted }]}>
                {venta.cliente?.email || venta.cliente_email || 'Sin correo registrado'}
              </Text>
            </View>
          </View>

          {venta.cliente?.telefono && (
            <Text style={[styles.clientDetailItem, { color: colors.textSecondary }]}>
              📞 Teléfono: {venta.cliente.telefono}
            </Text>
          )}
          {venta.cliente?.direccion && (
            <Text style={[styles.clientDetailItem, { color: colors.textSecondary }]}>
              📍 Dirección: {venta.cliente.direccion}
            </Text>
          )}
        </GlassCard>

        {/* Artículos de la Venta */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Artículos Facturados ({venta.detalles.length})
        </Text>
        <GlassCard style={styles.card}>
          {venta.detalles.map((item) => (
            <View key={item.id} style={[styles.detailItemRow, { borderBottomColor: colors.divider }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                  {item.producto_nombre}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textMuted }]}>
                  {item.cantidad} x {formatCurrency(item.precio_unitario)}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </GlassCard>

        {/* Desglose Económico e Impuestos */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Liquidación
        </Text>
        <GlassCard style={[styles.card, { borderColor: Palette.cyan400 }]}>
          <View style={styles.taxLine}>
            <Text style={[styles.taxLabel, { color: colors.textSecondary }]}>Subtotal Base</Text>
            <Text style={[styles.taxValue, { color: colors.textPrimary }]}>
              {formatCurrency(venta.subtotal)}
            </Text>
          </View>

          <View style={styles.taxLine}>
            <Text style={[styles.taxLabel, { color: colors.textSecondary }]}>IVA (19% Legal)</Text>
            <Text style={[styles.taxValue, { color: colors.accentCyan }]}>
              {formatCurrency(venta.impuesto)}
            </Text>
          </View>

          <View style={[styles.taxLine, styles.totalRow, { borderTopColor: colors.divider }]}>
            <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>TOTAL FACTURADO</Text>
            <Text style={[styles.totalValue, { color: Palette.emerald400 }]}>
              {formatCurrency(venta.total)}
            </Text>
          </View>
        </GlassCard>

        {/* Acciones de Venta */}
        <View style={styles.actionsContainer}>
          {venta.estado === 'pendiente' && (
            <GradientButton
              title="Marcar como Pagada"
              icon="checkmark-circle-outline"
              variant="success"
              loading={loadingAction}
              onPress={handlePagar}
              style={{ marginBottom: Spacing.sm }}
            />
          )}

          {venta.estado !== 'anulada' && (
            <GradientButton
              title="Anular Factura y Devolver Stock"
              icon="close-circle-outline"
              variant="danger"
              loading={loadingAction}
              onPress={() => setModalAnularVisible(true)}
            />
          )}
        </View>
      </ScrollView>

      {/* Modal de Confirmación de Anulación */}
      <ConfirmModal
        visible={modalAnularVisible}
        title="¿Anular Factura de Venta?"
        message="Esta acción es irreversible. El estado pasará a 'anulada' y todos los artículos vendidos serán reintegrados de inmediato al inventario."
        confirmText="Confirmar Anulación"
        cancelText="Conservar Factura"
        variant="danger"
        onConfirm={handleAnular}
        onCancel={() => setModalAnularVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    ...Typography.bodyBold,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  statusCard: {
    marginBottom: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  statusTitle: {
    ...Typography.title2,
    fontWeight: '800',
    marginTop: 2,
  },
  anuladaNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  anuladaNoticeText: {
    ...Typography.caption,
    color: Palette.rose400,
    flex: 1,
  },
  sectionTitle: {
    ...Typography.title3,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientName: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
  clientSub: {
    ...Typography.caption,
  },
  clientDetailItem: {
    ...Typography.caption,
    marginTop: 4,
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemName: {
    ...Typography.bodyBold,
  },
  itemSub: {
    ...Typography.caption,
    marginTop: 2,
  },
  itemTotal: {
    ...Typography.bodyBold,
    fontSize: 15,
  },
  taxLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  taxLabel: {
    ...Typography.body,
  },
  taxValue: {
    ...Typography.bodyBold,
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  totalLabel: {
    ...Typography.title3,
    fontWeight: '800',
  },
  totalValue: {
    ...Typography.title1,
    fontWeight: '900',
  },
  actionsContainer: {
    marginTop: Spacing.sm,
  },
});
