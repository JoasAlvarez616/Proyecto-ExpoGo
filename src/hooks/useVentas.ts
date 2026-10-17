import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { VentaService } from '../services/VentaService';
import { EstadoVenta, Venta } from '../types';

export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoVenta | 'todas'>('todas');
  const [busqueda, setBusqueda] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarVentas = useCallback((isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const lista = VentaService.getAll({
        estado: filtroEstado === 'todas' ? undefined : filtroEstado,
        search: busqueda,
      });
      setVentas(lista);
    } catch (err: any) {
      console.error('Error al cargar ventas:', err);
      setError(err?.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtroEstado, busqueda]);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const anularVenta = async (id: number, motivo?: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      VentaService.anularVenta(id, 'admin', motivo);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cargarVentas();
      return { success: true };
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: err?.message || 'No se pudo anular la venta' };
    }
  };

  const pagarVenta = async (id: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      VentaService.pagarVenta(id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cargarVentas();
      return { success: true };
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: err?.message || 'No se pudo actualizar el pago' };
    }
  };

  return {
    ventas,
    loading,
    refreshing,
    error,
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
    refresh: () => cargarVentas(true),
    anularVenta,
    pagarVenta,
  };
}

