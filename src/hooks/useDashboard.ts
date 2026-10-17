import { useCallback, useEffect, useState } from 'react';
import { VentaService } from '../services/VentaService';
import { MetricasDashboard } from '../types';

export function useDashboard() {
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarMetricas = useCallback((isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = VentaService.getDashboardMetrics();
      setMetricas(data);
    } catch (err: any) {
      console.error('Error al cargar métricas:', err);
      setError(err?.message || 'Error al compilar métricas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarMetricas();
  }, [cargarMetricas]);

  const refresh = useCallback(() => {
    cargarMetricas(true);
  }, [cargarMetricas]);

  return { metricas, loading, refreshing, error, refresh };
}