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
import { ProductoService } from '../../src/services/ProductoService';
import { AuditService } from '../../src/services/AuditService';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/Header';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedBadge } from '../../src/components/AnimatedBadge';
import { GradientButton } from '../../src/components/GradientButton';
import { ConfirmModal } from '../../src/components/ConfirmModal';
import { formatCurrency, formatDate } from '../../src/utils/formatters';
import { calculateProfitMargin } from '../../src/utils/calculations';
import { useSaleWizardStore } from '../../src/store/saleWizardStore';
import { AuditLog, Producto } from '../../src/types';
import { BorderRadius, Palette, Spacing, Typography } from '../../src/theme/tokens';

export default function DetalleProductoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);

  const addItemToSale = useSaleWizardStore((state) => state.addItem);

  const cargarProducto = () => {
    if (!id) return;
    const prodId = parseInt(id, 10);
    const prod = ProductoService.getById(prodId);
    setProducto(prod);

    const auditList = AuditService.getLogsByEntity('Producto', prodId);
    setLogs(auditList);
    setLoading(false);
  };

  useEffect(() => {
    cargarProducto();
  }, [id]);

  const handleEliminar = () => {
    if (!producto) return;
    ProductoService.deleteLogical(producto.id);
    setModalDeleteVisible(false);
    router.replace('/(tabs)/productos');
  };

  const handleVenderDirecto = () => {
    if (!producto) return;
    addItemToSale(producto, 1);
    router.push('/venta/nueva');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Detalle del Producto" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
        </View>
      </SafeAreaView>
    );
  }

  if (!producto) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Producto no encontrado" showBack />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Palette.rose400} />
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            El producto solicitado no existe o fue desactivado.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { gananciaNeta, margenPorcentaje } = calculateProfitMargin(
    producto.precio_compra,
    producto.precio_venta
  );
  const isLowStock = producto.stock <= producto.stock_minimo;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title={producto.nombre}
        subtitle={producto.categoria_nombre || 'Inventario'}
        showBack
        rightAction={{
          icon: 'pencil',
          onPress: () => router.push(`/producto/nuevo?id=${producto.id}`),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cabecera / Hero Card */}
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroBadgesRow}>
            <View style={styles.categoryPill}>
              <Text style={[styles.categoryText, { color: colors.accentCyan }]}>
                {producto.categoria_nombre || 'General'}
              </Text>
            </View>

            {isLowStock ? (
              <AnimatedBadge type="bajo_stock" label={`Alerta: ${producto.stock} unidades`} />
            ) : (
              <AnimatedBadge type="activo" label={`${producto.stock} disponibles`} />
            )}
          </View>

          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
            {producto.nombre}
          </Text>

          {producto.descripcion ? (
            <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
              {producto.descripcion}
            </Text>
          ) : null}
        </GlassCard>

        {/* Desglose Financiero y de Precios */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Estructura de Rentabilidad
        </Text>

        <View style={styles.gridTwoColumns}>
          <GlassCard style={styles.gridCard}>
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Precio Venta</Text>
            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
              {formatCurrency(producto.precio_venta)}
            </Text>
            <Text style={[styles.cardNote, { color: Palette.emerald400 }]}>
              Margen: +{margenPorcentaje}%
            </Text>
          </GlassCard>

          <GlassCard style={styles.gridCard}>
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Precio Compra</Text>
            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
              {formatCurrency(producto.precio_compra)}
            </Text>
            <Text style={[styles.cardNote, { color: colors.textMuted }]}>Costo adquisición</Text>
          </GlassCard>
        </View>

        <GlassCard style={[styles.profitSummaryCard, { borderColor: Palette.emerald500 }]}>
          <View style={styles.profitRow}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textMuted }]}>
                Utilidad Neta por Unidad
              </Text>
              <Text style={[styles.profitHighlight, { color: Palette.emerald400 }]}>
                {formatCurrency(gananciaNeta)}
              </Text>
            </View>
            <View style={styles.iconCircleProfit}>
              <Ionicons name="trending-up" size={24} color={Palette.emerald400} />
            </View>
          </View>
        </GlassCard>

        {/* Estado del Inventario */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Nivel de Inventario
        </Text>

        <GlassCard style={styles.stockCard}>
          <View style={styles.stockInfoRow}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Stock Físico</Text>
              <Text style={[styles.stockValue, { color: isLowStock ? Palette.amber400 : colors.textPrimary }]}>
                {producto.stock} unidades
              </Text>
            </View>

            <View style={styles.stockMinimoWrap}>
              <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Umbral Mínimo</Text>
              <Text style={[styles.stockMinimoText, { color: colors.textSecondary }]}>
                {producto.stock_minimo} unidades
              </Text>
            </View>
          </View>

          {isLowStock && (
            <View style={styles.stockWarningBox}>
              <Ionicons name="warning-outline" size={16} color={Palette.amber400} />
              <Text style={styles.stockWarningText}>
                El stock se encuentra por debajo o igual al mínimo seguro. Considera emitir una orden de compra.
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Historial de Auditoría */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Historial y Auditoría
        </Text>

        {logs.length > 0 ? (
          logs.map((log) => (
            <GlassCard key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <Text style={[styles.logAction, { color: colors.accentCyan }]}>
                  {log.accion} por {log.usuario}
                </Text>
                <Text style={[styles.logDate, { color: colors.textMuted }]}>
                  {formatDate(log.timestamp)}
                </Text>
              </View>
              {log.detalles && (
                <Text style={[styles.logDetails, { color: colors.textSecondary }]}>
                  {log.detalles}
                </Text>
              )}
            </GlassCard>
          ))
        ) : (
          <GlassCard style={styles.emptyLogCard}>
            <Text style={[styles.cardNote, { color: colors.textMuted }]}>
              Sin registros de auditoría adicionales.
            </Text>
          </GlassCard>
        )}

        {/* Botones de Acción */}
        <View style={styles.actionsSection}>
          <GradientButton
            title="Agregar a Nueva Venta"
            icon="cart-outline"
            variant="primary"
            onPress={handleVenderDirecto}
            disabled={producto.stock <= 0}
            style={{ marginBottom: Spacing.md }}
          />

          <View style={styles.secondaryButtonsRow}>
            <View style={{ flex: 1 }}>
              <GradientButton
                title="Editar"
                icon="pencil-outline"
                variant="secondary"
                onPress={() => router.push(`/producto/nuevo?id=${producto.id}`)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <GradientButton
                title="Desactivar"
                icon="trash-outline"
                variant="danger"
                onPress={() => setModalDeleteVisible(true)}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Confirmación de Borrado */}
      <ConfirmModal
        visible={modalDeleteVisible}
        title="¿Desactivar producto?"
        message={`¿Estás seguro de desactivar "${producto.nombre}"? No aparecerá en el inventario activo ni podrá venderse.`}
        confirmText="Desactivar"
        cancelText="Volver"
        variant="danger"
        onConfirm={handleEliminar}
        onCancel={() => setModalDeleteVisible(false)}
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
  heroCard: {
    marginBottom: Spacing.lg,
  },
  heroBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
  },
  categoryText: {
    ...Typography.captionBold,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...Typography.title1,
    marginBottom: Spacing.xs,
  },
  heroDescription: {
    ...Typography.body,
    lineHeight: 22,
  },
  sectionTitle: {
    ...Typography.title3,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  gridTwoColumns: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  gridCard: {
    flex: 1,
  },
  cardLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontSize: 11,
  },
  cardValue: {
    ...Typography.title2,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardNote: {
    ...Typography.captionBold,
    fontSize: 11,
  },
  profitSummaryCard: {
    marginBottom: Spacing.md,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitHighlight: {
    ...Typography.hero,
    fontWeight: '800',
  },
  iconCircleProfit: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockCard: {
    marginBottom: Spacing.lg,
  },
  stockInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockValue: {
    ...Typography.title1,
    fontWeight: '800',
  },
  stockMinimoWrap: {
    alignItems: 'flex-end',
  },
  stockMinimoText: {
    ...Typography.title3,
  },
  stockWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  stockWarningText: {
    ...Typography.caption,
    color: Palette.amber400,
    flex: 1,
  },
  logCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  emptyLogCard: {
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logAction: {
    ...Typography.captionBold,
  },
  logDate: {
    ...Typography.caption,
    fontSize: 11,
  },
  logDetails: {
    ...Typography.caption,
    marginTop: 2,
  },
  actionsSection: {
    marginTop: Spacing.lg,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});

