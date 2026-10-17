import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { CategoriaService } from '../services/CategoriaService';
import { ProductoService } from '../services/ProductoService';
import { Categoria, Producto } from '../types';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number>(0);
  const [busqueda, setBusqueda] = useState<string>('');
  const [soloBajoStock, setSoloBajoStock] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback((isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const cats = CategoriaService.getAll();
      setCategorias(cats);
      const prods = ProductoService.getAll({
        search: busqueda,
        categoriaId: categoriaSeleccionada,
        soloBajoStock,
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

  const refresh = useCallback(() => {
    cargarDatos(true);
  }, [cargarDatos]);

  const eliminarProducto = async (id: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      ProductoService.deleteLogical(id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: err?.message || 'No se pudo eliminar' };
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
    refresh,
    eliminarProducto,
  };
}