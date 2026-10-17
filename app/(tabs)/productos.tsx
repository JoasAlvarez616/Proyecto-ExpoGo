import React, { useState } from 'react';
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
import { useProductos } from '../../src/hooks/useProductos';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/Header';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoryChip } from '../../src/components/CategoryChip';
import { ProductCard } from '../../src/components/ProductCard';
import { SwipeableRow } from '../../src/components/SwipeableRow';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { CardSkeleton } from '../../src/components/Skeleton';
import { ConfirmModal } from '../../src/components/ConfirmModal';
import { GlassCard } from '../../src/components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Spacing, Typography } from '../../src/theme/tokens';
import { Producto } from '../../src/types';

export default function ProductosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    productos,
    categorias,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    busqueda,
    setBusqueda,
    soloBajoStock,
    setSoloBajoStock,
    loading,
    refreshing,
    refresh,
    eliminarProducto,
  } = useProductos();



  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const confirmarEliminacion = (prod: Producto) => {
    setProductoAEliminar(prod);
    setModalVisible(true);
  };

  const ejecutarEliminacion = async () => {
    if (productoAEliminar) {
      await eliminarProducto(productoAEliminar.id);
      setModalVisible(false);
      setProductoAEliminar(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="Inventario"
        subtitle={`${productos.length} productos registrados`}
        rightAction={{
          icon: 'add',
          onPress: () => router.push('/producto/nuevo'),
        }}
      />

      <View style={styles.content}>
        {/* Barra de Búsqueda */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por nombre o descripción..."
          />
        </View>

        {/* Filtros por Categoría */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <CategoryChip
              label="Todos"
              selected={categoriaSeleccionada === 0 && !soloBajoStock}
              onPress={() => {
                setCategoriaSeleccionada(0);
                setSoloBajoStock(false);
              }}
            />

            <CategoryChip
              label="⚠️ Stock Bajo"
              selected={soloBajoStock}
              onPress={() => {
                setCategoriaSeleccionada(0);
                setSoloBajoStock(!soloBajoStock);
              }}
            />

            {categorias.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.nombre}
                selected={categoriaSeleccionada === cat.id && !soloBajoStock}
                onPress={() => {
                  setSoloBajoStock(false);
                  setCategoriaSeleccionada(cat.id);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Lista de Productos con Animación FadeInDown Escalonada */}
        {loading && !refreshing ? (
          <View style={styles.skeletonContainer}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : (
          <FlatList
            data={productos}
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
              <Animated.View entering={FadeInDown.delay(Math.min(index * 45, 320)).springify()}>
                <SwipeableRow
                  onDelete={() => confirmarEliminacion(item)}
                  deleteLabel="Desactivar"
                >
                  <ProductCard
                    producto={item}
                    onPress={() => router.push(`/producto/${item.id}`)}
                  />
                </SwipeableRow>
              </Animated.View>
            )}
            ListEmptyComponent={
              <GlassCard style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  No se encontraron productos
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  Intenta cambiar el término de búsqueda o selecciona otra categoría.
                </Text>
              </GlassCard>
            }
          />
        )}
      </View>

      {/* Botón Flotante para Crear Producto */}
      <FloatingActionButton
        icon="add"
        onPress={() => router.push('/producto/nuevo')}
      />

      {/* Modal de Confirmación para Borrado Lógico */}
      <ConfirmModal
        visible={modalVisible}
        title="¿Desactivar producto?"
        message={`El producto "${productoAEliminar?.nombre}" pasará a estado inactivo para proteger el historial de ventas registradas.`}
        confirmText="Desactivar"
        cancelText="Conservar"
        variant="danger"
        onConfirm={ejecutarEliminacion}
        onCancel={() => {
          setModalVisible(false);
          setProductoAEliminar(null);
        }}
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
  categoriesContainer: {
    marginBottom: Spacing.md,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 90, // Espacio para el FAB
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

