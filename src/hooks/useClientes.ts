import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ClienteService } from '../services/ClienteService';
import { Cliente, ClienteInput } from '../types';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarClientes = useCallback((isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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

  const crearCliente = async (data: ClienteInput) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const nuevo = ClienteService.create(data);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cargarClientes();
      return { success: true, cliente: nuevo };
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: err?.message || 'Error al registrar cliente' };
    }
  };

  const actualizarCliente = async (id: number, data: Partial<ClienteInput>) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const actualizado = ClienteService.update(id, data);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cargarClientes();
      return { success: true, cliente: actualizado };
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: err?.message || 'Error al actualizar cliente' };
    }
  };

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
      return { success: false, message: err?.message || 'Error al eliminar cliente' };
    }
  };

  return {
    clientes,
    loading,
    refreshing,
    error,
    busqueda,
    setBusqueda,
    refresh: () => cargarClientes(true),
    crearCliente,
    actualizarCliente,
    eliminarCliente,
  };
}
