// ============================================================================
// TIPOS Y MODELOS DEL DOMINIO: COMPRA Y VENTA
// ============================================================================

export type EstadoVenta = 'pendiente' | 'pagada' | 'anulada';
export type AccionAuditoria = 'CREATE' | 'UPDATE' | 'DELETE';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  created_at?: string;
}

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion?: string | null;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  imagen_uri?: string | null;
  activo: number; // 1 = activo, 0 = eliminado lógico
  categoria_nombre?: string;
}

export interface ProductoInput {
  categoria_id: number;
  nombre: string;
  descripcion?: string | null;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  imagen_uri?: string | null;
}

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  created_at?: string;
  total_compras?: number;
  ventas_count?: number;
}

export interface ClienteInput {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

export interface Venta {
  id: number;
  cliente_id: number;
  fecha: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: EstadoVenta;
  cliente_nombre?: string;
  cliente_email?: string;
  items_count?: number;
}

export interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto_nombre?: string;
}

export interface DetalleVentaInput {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface VentaCompletaInput {
  cliente_id: number;
  items: DetalleVentaInput[];
  estado?: EstadoVenta;
}

export interface VentaConDetalles extends Venta {
  detalles: DetalleVenta[];
  cliente?: Cliente;
}

export interface AuditLog {
  id: number;
  entidad: string;
  entidad_id: number;
  accion: AccionAuditoria;
  timestamp: string;
  usuario: string;
  detalles?: string | null;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface TotalesCalculados {
  subtotal: number;
  impuesto: number; // IVA 19%
  total: number;
  gananciaEstimada: number;
  itemsTotales: number;
}

export interface MetricasDashboard {
  ventasHoy: number;
  ingresosHoy: number;
  ventasMes: number;
  ingresosMes: number;
  productosBajoStockCount: number;
  productosBajoStock: Producto[];
  clientesActivosCount: number;
  ventasRecientes: Venta[];
  productosMasVendidos: Array<{
    producto_id: number;
    nombre: string;
    unidades_vendidas: number;
    total_recaudado: number;
  }>;
}