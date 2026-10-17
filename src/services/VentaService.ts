import { getDatabase } from '../db/database';
import {
  EstadoVenta,
  MetricasDashboard,
  Producto,
  Venta,
  VentaCompletaInput,
  VentaConDetalles,
} from '../types';
import { IVA_RATE } from '../utils/calculations';
import { AuditService } from './AuditService';
import { ClienteService } from './ClienteService';

export class VentaService {
  /**
   * Crea una venta completa con múltiples productos dentro de una transacción SQLite atómica.
   * Valida stock en tiempo real y descuenta inventario.
   */
  static createVenta(input: VentaCompletaInput, usuario: string = 'cajero_1'): VentaConDetalles {
    const db = getDatabase();

    if (!input.items || input.items.length === 0) {
      throw new Error('La venta debe tener al menos un producto.');
    }

    // 1. Validar existencia del cliente
    const cliente = ClienteService.getById(input.cliente_id);
    if (!cliente) {
      throw new Error(`El cliente seleccionado no existe.`);
    }

    let ventaId = 0;
    let subtotalTotal = 0;

    for (const item of input.items) {
      subtotalTotal += item.cantidad * item.precio_unitario;
    }

    const impuestoTotal = Math.round(subtotalTotal * IVA_RATE);
    const granTotal = subtotalTotal + impuestoTotal;
    const estadoInicial = input.estado || 'pagada';

    // 2. Ejecutar Transacción Atómica en SQLite
    db.withTransactionSync(() => {
      // Insertar cabecera de la venta
      const ventaRes = db.runSync(
        `INSERT INTO Venta (cliente_id, subtotal, impuesto, total, estado)
         VALUES (?, ?, ?, ?, ?);`,
        [input.cliente_id, subtotalTotal, impuestoTotal, granTotal, estadoInicial]
      );
      ventaId = ventaRes.lastInsertRowId;

      // Insertar cada detalle de venta, validar stock y descontar inventario dentro de la transacción
      for (const item of input.items) {
        const prod = db.getFirstSync<Producto>(
          'SELECT id, nombre, stock, precio_venta, activo FROM Producto WHERE id = ?;',
          [item.producto_id]
        );

        if (!prod || prod.activo === 0) {
          throw new Error(`El producto #${item.producto_id} no se encuentra disponible.`);
        }

        if (prod.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para "${prod.nombre}". Solicitado: ${item.cantidad}, Disponible: ${prod.stock}`
          );
        }

        const itemSubtotal = item.cantidad * item.precio_unitario;

        db.runSync(
          `INSERT INTO DetalleVenta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?);`,
          [ventaId, item.producto_id, item.cantidad, item.precio_unitario, itemSubtotal]
        );

        // Descontar inventario de forma segura
        db.runSync(
          `UPDATE Producto 
           SET stock = stock - ? 
           WHERE id = ?;`,
          [item.cantidad, item.producto_id]
        );
      }

      // Registrar auditoría
      AuditService.log(
        'Venta',
        ventaId,
        'CREATE',
        usuario,
        `Venta #${ventaId} creada para cliente ${cliente.nombre}. Total: ${granTotal}. Items: ${input.items.length}`
      );
    });

    const creada = this.getById(ventaId);
    if (!creada) {
      throw new Error('Error al recuperar la venta recién procesada.');
    }
    return creada;
  }

  /**
   * Obtiene el listado de ventas con datos del cliente y conteo de items
   */
  static getAll(options?: { estado?: EstadoVenta; search?: string }): Venta[] {
    const db = getDatabase();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (options?.estado) {
      conditions.push('v.estado = ?');
      params.push(options.estado);
    }

    if (options?.search && options.search.trim() !== '') {
      conditions.push('(c.nombre LIKE ? OR c.email LIKE ? OR CAST(v.id AS TEXT) LIKE ?)');
      const pattern = `%${options.search.trim()}%`;
      params.push(pattern, pattern, pattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        v.*,
        c.nombre AS cliente_nombre,
        c.email AS cliente_email,
        COUNT(d.id) AS items_count
      FROM Venta v
      LEFT JOIN Cliente c ON v.cliente_id = c.id
      LEFT JOIN DetalleVenta d ON v.id = d.venta_id
      ${whereClause}
      GROUP BY v.id
      ORDER BY v.id DESC;
    `;

    return db.getAllSync<Venta>(query, params);
  }

  /**
   * Obtiene el detalle completo de una venta con sus productos
   */
  static getById(id: number): VentaConDetalles | null {
    const db = getDatabase();

    const venta = db.getFirstSync<Venta>(
      `SELECT 
        v.*,
        c.nombre AS cliente_nombre,
        c.email AS cliente_email
      FROM Venta v
      LEFT JOIN Cliente c ON v.cliente_id = c.id
      WHERE v.id = ?;`,
      [id]
    );

    if (!venta) return null;

    const cliente = ClienteService.getById(venta.cliente_id) || undefined;

    const detalles = db.getAllSync<{
      id: number;
      venta_id: number;
      producto_id: number;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
      producto_nombre: string;
    }>(
      `SELECT 
        d.*,
        p.nombre AS producto_nombre
      FROM DetalleVenta d
      LEFT JOIN Producto p ON d.producto_id = p.id
      WHERE d.venta_id = ?;`,
      [id]
    );

    return {
      ...venta,
      cliente,
      detalles,
    };
  }

  /**
   * Anula una venta y devuelve el stock de cada producto al inventario dentro de una transacción atómica
   */
  static anularVenta(id: number, usuario: string = 'admin', motivo?: string): boolean {
    const db = getDatabase();
    const venta = this.getById(id);

    if (!venta) {
      throw new Error(`Venta #${id} no encontrada.`);
    }

    if (venta.estado === 'anulada') {
      throw new Error('Esta venta ya se encuentra anulada.');
    }

    db.withTransactionSync(() => {
      // 1. Devolver stock de cada item al inventario
      for (const item of venta.detalles) {
        db.runSync(
          `UPDATE Producto 
           SET stock = stock + ? 
           WHERE id = ?;`,
          [item.cantidad, item.producto_id]
        );
      }

      // 2. Marcar la venta como anulada
      db.runSync(`UPDATE Venta SET estado = 'anulada' WHERE id = ?;`, [id]);

      // 3. Registrar auditoría con el motivo
      AuditService.log(
        'Venta',
        id,
        'UPDATE',
        usuario,
        `Venta anulada. Motivo: ${motivo || 'Cancelación de pedido'}. Stock retornado automáticamente.`
      );
    });

    return true;
  }

  /**
   * Cambia el estado de una venta pendiente a pagada
   */
  static pagarVenta(id: number, usuario: string = 'cajero_1'): boolean {
    const db = getDatabase();
    const venta = this.getById(id);

    if (!venta) {
      throw new Error(`Venta #${id} no encontrada.`);
    }

    if (venta.estado === 'pagada') {
      return true;
    }

    if (venta.estado === 'anulada') {
      throw new Error('Una venta anulada no puede ser pagada directamente.');
    }

    db.withTransactionSync(() => {
      db.runSync(`UPDATE Venta SET estado = 'pagada' WHERE id = ?;`, [id]);
      AuditService.log('Venta', id, 'UPDATE', usuario, 'Venta marcada como PAGADA');
    });

    return true;
  }

  /**
   * Calcula y compila las métricas comerciales para el Dashboard principal
   */
  static getDashboardMetrics(): MetricasDashboard {
    const db = getDatabase();

    // 1. Métricas del día de hoy
    const hoyRes = db.getFirstSync<{ count: number; total: number }>(`
      SELECT 
        COUNT(*) as count, 
        COALESCE(SUM(total), 0) as total 
      FROM Venta 
      WHERE DATE(fecha, 'localtime') = DATE('now', 'localtime') AND estado = 'pagada';
    `);

    // 2. Métricas del mes actual
    const mesRes = db.getFirstSync<{ count: number; total: number }>(`
      SELECT 
        COUNT(*) as count, 
        COALESCE(SUM(total), 0) as total 
      FROM Venta 
      WHERE strftime('%Y-%m', fecha, 'localtime') = strftime('%Y-%m', 'now', 'localtime') AND estado = 'pagada';
    `);

    // 3. Productos con bajo stock
    const productosBajoStock = db.getAllSync<Producto>(`
      SELECT 
        p.*, 
        c.nombre AS categoria_nombre 
      FROM Producto p
      LEFT JOIN Categoria c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND p.stock <= p.stock_minimo
      ORDER BY p.stock ASC;
    `);

    // 4. Clientes activos
    const clientesRes = db.getFirstSync<{ count: number }>(`
      SELECT COUNT(*) as count FROM Cliente;
    `);

    // 5. Ventas recientes (últimas 5)
    const ventasRecientes = this.getAll().slice(0, 5);

    // 6. Productos más vendidos
    const productosMasVendidos = db.getAllSync<{
      producto_id: number;
      nombre: string;
      unidades_vendidas: number;
      total_recaudado: number;
    }>(`
      SELECT 
        p.id AS producto_id,
        p.nombre,
        SUM(d.cantidad) AS unidades_vendidas,
        SUM(d.subtotal) AS total_recaudado
      FROM DetalleVenta d
      JOIN Producto p ON d.producto_id = p.id
      JOIN Venta v ON d.venta_id = v.id
      WHERE v.estado = 'pagada'
      GROUP BY p.id
      ORDER BY unidades_vendidas DESC
      LIMIT 5;
    `);

    return {
      ventasHoy: hoyRes?.count || 0,
      ingresosHoy: hoyRes?.total || 0,
      ventasMes: mesRes?.count || 0,
      ingresosMes: mesRes?.total || 0,
      productosBajoStockCount: productosBajoStock.length,
      productosBajoStock,
      clientesActivosCount: clientesRes?.count || 0,
      ventasRecientes,
      productosMasVendidos,
    };
  }
}

