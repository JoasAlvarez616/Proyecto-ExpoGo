import { TotalesCalculados } from '../types';

export const IVA_RATE = 0.19; // 19% Estándar de impuesto sobre las ventas

export interface CalculationItem {
  cantidad: number;
  precio_unitario: number;
  precio_compra?: number;
}

export function calculateTotals(items: CalculationItem[]): TotalesCalculados {
  let subtotal = 0;
  let costoTotal = 0;
  let itemsTotales = 0;

  for (const item of items) {
    const itemSubtotal = item.cantidad * item.precio_unitario;
    subtotal += itemSubtotal;
    itemsTotales += item.cantidad;

    if (item.precio_compra !== undefined) {
      costoTotal += item.cantidad * item.precio_compra;
    }
  }

  const impuesto = Math.round(subtotal * IVA_RATE);
  const total = subtotal + impuesto;
  const gananciaEstimada = subtotal > 0 && costoTotal > 0 ? subtotal - costoTotal : 0;

  return {
    subtotal,
    impuesto,
    total,
    gananciaEstimada,
    itemsTotales,
  };
}

export function calculateProfitMargin(precioCompra: number, precioVenta: number): {
  gananciaNeta: number;
  margenPorcentaje: number;
} {
  const gananciaNeta = precioVenta - precioCompra;
  const margenPorcentaje = precioCompra > 0 ? (gananciaNeta / precioCompra) * 100 : 0;

  return {
    gananciaNeta,
    margenPorcentaje: Math.round(margenPorcentaje * 10) / 10,
  };
}
