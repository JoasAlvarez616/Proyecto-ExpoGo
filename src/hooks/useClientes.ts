import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ClienteService } from '../services/ClienteService';
import { Cliente } from '../types';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarClientes = useCallback((isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const lista = ClienteService.getAll(busqueda);
      setClientes(lista);
    } catch (err: any) {
      console.error('Error al cargar clientes:', err);
      setError(err?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [busqueda]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const refresh = useCallback(() => {
    cargarClientes(true);
  }, [cargarClientes]);

  const eliminarCliente = async (id: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const resultado = ClienteService.deletePhysical(id);
      if (resultado.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setClientes((prev) => prev.filter((c) => c.id !== id));
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return resultado;
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: err?.message || 'Error al eliminar' };
    }
  };

  return {
    clientes,
    loading,
    refreshing,
    error,
    busqueda,
    setBusqueda,
    refresh,
    eliminarCliente,
  };
}