import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { CategoriaService } from '../services/CategoriaService';
import { ProductoService } from '../services/ProductoService';
import { Categoria, Producto, ProductoInput } from '../types';

export function useProductos(initialFilter?: { soloBajoStock?: boolean }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number>(0); // 0 = Todas
  const [busqueda, setBusqueda] = useState<string>('');
  const [soloBajoStock, setSoloBajoStock] = useState<boolean>(initialFilter?.soloBajoStock || false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback((isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Cargar categorías
      const cats = CategoriaService.getAll();
      setCategorias(cats);

      // Cargar productos con filtros activos
      const prods = ProductoService.getAll({
        search: busqueda,
        categoriaId: categoriaSeleccionada,
        soloBajoStock: soloBajoStock,
      });
      setProductos(prods);
    } catch (err: any) {
      console.error('Error al cargar productos:', err);
      setError(err?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [busqueda, categoriaSeleccionada, soloBajoStock]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const eliminarProducto = async (id: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      ProductoService.deleteLogical(id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Actualizar lista local de inmediato para respuesta reactiva instantánea
      setProductos((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: err?.message || 'No se pudo eliminar el producto' };
    }
  };

  const crearProducto = async (data: ProductoInput) => {
    try {
      const nuevo = ProductoService.create(data);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cargarDatos();
      return { success: true, producto: nuevo };
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: err?.message || 'Error al crear producto' };
    }
  };

  const actualizarProducto = async (id: number, data: Partial<ProductoInput>) => {
    try {
      const actualizado = ProductoService.update(id, data);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cargarDatos();
      return { success: true, producto: actualizado };
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: err?.message || 'Error al actualizar producto' };
    }
  };

  return {
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
    error,
    refresh: () => cargarDatos(true),
    eliminarProducto,
    crearProducto,
    actualizarProducto,
  };
}

