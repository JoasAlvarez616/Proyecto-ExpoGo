import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDashboard } from '../../src/hooks/useDashboard';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/Header';
import { MetricCard } from '../../src/components/MetricCard';
import { SaleCard } from '../../src/components/SaleCard';
import { GlassCard } from '../../src/components/GlassCard';
import { Skeleton } from '../../src/components/Skeleton';
import { GradientButton } from '../../src/components/GradientButton';
import { BorderRadius, Gradients, Palette, Spacing, Typography } from '../../src/theme/tokens';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { metricas, loading, refreshing, refresh } = useDashboard();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="ComercioPro"
        subtitle="Panel de Control y Finanzas"
        rightAction={{
          icon: 'people',
          onPress: () => router.push('/cliente'),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.accentCyan}
            colors={[Palette.cyan400]}
          />
        }
      >
        {/* Banner de Acciones Rápidas */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.primaryActionWrap}>
            <GradientButton
              title="Nueva Venta"
              icon="add-circle"
              variant="primary"
              onPress={() => router.push('/venta/nueva')}
            />
          </View>
          <View style={styles.secondaryActionWrap}>
            <GradientButton
              title="Nuevo Producto"
              icon="cube"
              variant="secondary"
              onPress={() => router.push('/producto/nuevo')}
            />
          </View>
        </View>

        {/* Métricas Principales */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Rendimiento Comercial
          </Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.metricsGrid}>
            <Skeleton height={140} borderRadius={BorderRadius.lg} style={{ flex: 1 }} />
            <Skeleton height={140} borderRadius={BorderRadius.lg} style={{ flex: 1 }} />
          </View>
        ) : (
          <>
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Ingresos Hoy"
                value={metricas?.ingresosHoy || 0}
                isCurrency={true}
                icon="cash-outline"
                gradientColors={Gradients.cyanPrimary}
                subtitle={`${metricas?.ventasHoy || 0} operaciones hoy`}
                trend="+12%"
                trendPositive={true}
              />
              <MetricCard
                title="Ventas del Mes"
                value={metricas?.ingresosMes || 0}
                isCurrency={true}
                icon="stats-chart"
                gradientColors={Gradients.violetSecondary}
                subtitle={`${metricas?.ventasMes || 0} ventas totales`}
              />
            </View>

            <View style={[styles.metricsGrid, { marginTop: Spacing.md }]}>
              <MetricCard
                title="Stock Crítico"
                value={metricas?.productosBajoStockCount || 0}
                isCurrency={false}
                icon="alert-circle-outline"
                gradientColors={Gradients.amberWarning}
                subtitle="Productos a reponer"
                trend={metricas?.productosBajoStockCount ? 'Alerta' : 'Óptimo'}
                trendPositive={!metricas?.productosBajoStockCount}
                onPress={() => router.push('/(tabs)/productos')}
              />
              <MetricCard
                title="Clientes Activos"
                value={metricas?.clientesActivosCount || 0}
                isCurrency={false}
                icon="people-outline"
                gradientColors={Gradients.emeraldSuccess}
                subtitle="Cartera registrada"
                onPress={() => router.push('/cliente')}
              />
            </View>
          </>
        )}

        {/* Alerta de Stock Bajo */}
        {metricas?.productosBajoStock && metricas.productosBajoStock.length > 0 && (
          <View style={styles.alertSection}>
            <GlassCard
              onPress={() => router.push('/(tabs)/productos')}
              style={[styles.stockAlertCard, { borderColor: Palette.amber400 }]}
            >
              <View style={styles.stockAlertHeader}>
                <View style={styles.alertIconCircle}>
                  <Ionicons name="warning" size={20} color={Palette.amber400} />
                </View>
                <View style={styles.alertTextWrapper}>
                  <Text style={[styles.alertTitle, { color: colors.textPrimary }]}>
                    Atención: {metricas.productosBajoStock.length} productos con stock bajo
                  </Text>
                  <Text style={[styles.alertDescription, { color: colors.textMuted }]}>
                    Artículos como "{metricas.productosBajoStock[0].nombre}" requieren reabastecimiento urgente.
                  </Text>
                </View>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Ventas Recientes */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Transacciones Recientes
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/ventas')} hitSlop={10}>
            <Text style={[styles.viewAllText, { color: colors.accentCyan }]}>Ver todas</Text>
          </Pressable>
        </View>

        {loading && !refreshing ? (
          <View>
            <Skeleton height={100} borderRadius={BorderRadius.lg} style={{ marginBottom: 12 }} />
            <Skeleton height={100} borderRadius={BorderRadius.lg} style={{ marginBottom: 12 }} />
          </View>
        ) : metricas?.ventasRecientes && metricas.ventasRecientes.length > 0 ? (
          metricas.ventasRecientes.map((venta) => (
            <SaleCard
              key={venta.id}
              venta={venta}
              onPress={() => router.push(`/venta/${venta.id}`)}
            />
          ))
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Sin ventas registradas
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Presiona en "Nueva Venta" para comenzar a facturar.
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  primaryActionWrap: {
    flex: 1.2,
  },
  secondaryActionWrap: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.title2,
  },
  viewAllText: {
    ...Typography.captionBold,
    fontSize: 13,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  alertSection: {
    marginTop: Spacing.lg,
  },
  stockAlertCard: {
    borderLeftWidth: 4,
  },
  stockAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  alertIconCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextWrapper: {
    flex: 1,
  },
  alertTitle: {
    ...Typography.bodyBold,
    marginBottom: 2,
  },
  alertDescription: {
    ...Typography.caption,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.title3,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: 4,
  },
});

