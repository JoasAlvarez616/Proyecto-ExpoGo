import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useVentas } from '../../src/hooks/useVentas';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/Header';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoryChip } from '../../src/components/CategoryChip';
import { SaleCard } from '../../src/components/SaleCard';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { CardSkeleton } from '../../src/components/Skeleton';
import { GlassCard } from '../../src/components/GlassCard';
import { Palette, Spacing, Typography } from '../../src/theme/tokens';
import { EstadoVenta } from '../../src/types';

export default function VentasScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    ventas,
    loading,
    refreshing,
    refresh,
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
  } = useVentas();

  const estados: Array<{ label: string; value: EstadoVenta | 'todas' }> = [
    { label: 'Todas', value: 'todas' },
    { label: 'Pagadas', value: 'pagada' },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Anuladas', value: 'anulada' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="Historial de Ventas"
        subtitle={`${ventas.length} facturas emitidas`}
        rightAction={{
          icon: 'cart',
          onPress: () => router.push('/venta/nueva'),
        }}
      />

      <View style={styles.content}>
        {/* Barra de Búsqueda */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por cliente o # factura..."
          />
        </View>

        {/* Filtros por Estado */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {estados.map((item) => (
              <CategoryChip
                key={item.value}
                label={item.label}
                selected={filtroEstado === item.value}
                onPress={() => setFiltroEstado(item.value)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Listado de Ventas con Skeleton Shimmer */}
        {loading && !refreshing ? (
          <View style={styles.skeletonContainer}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : (
          <FlatList
            data={ventas}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={colors.accentCyan}
                colors={[Palette.cyan400]}
              />
            }
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
                <SaleCard
                  venta={item}
                  onPress={() => router.push(`/venta/${item.id}`)}
                />
              </Animated.View>
            )}
            ListEmptyComponent={
              <GlassCard style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  No hay ventas que coincidan
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  No se encontraron ventas para el filtro seleccionado.
                </Text>
              </GlassCard>
            }
          />
        )}
      </View>

      {/* FAB para Iniciar Nueva Venta */}
      <FloatingActionButton
        icon="cart-outline"
        onPress={() => router.push('/venta/nueva')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
  },
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 90,
  },
  skeletonContainer: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.title3,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: Spacing.xl,
  },
});

