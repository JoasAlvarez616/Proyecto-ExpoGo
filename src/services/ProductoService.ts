import { getDatabase } from '../db/database';
import { Producto, ProductoInput } from '../types';
import { AuditService } from './AuditService';

export class ProductoService {
  /**
   * Obtiene la lista de productos activos con filtros opcionales
   */
  static getAll(options?: {
    search?: string;
    categoriaId?: number;
    soloBajoStock?: boolean;
    incluirInactivos?: boolean;
  }): Producto[] {
    const db = getDatabase();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (!options?.incluirInactivos) {
      conditions.push('p.activo = 1');
    }

    if (options?.categoriaId && options.categoriaId > 0) {
      conditions.push('p.categoria_id = ?');
      params.push(options.categoriaId);
    }

    if (options?.search && options.search.trim() !== '') {
      conditions.push('(p.nombre LIKE ? OR p.descripcion LIKE ?)');
      const pattern = `%${options.search.trim()}%`;
      params.push(pattern, pattern);
    }

    if (options?.soloBajoStock) {
      conditions.push('p.stock <= p.stock_minimo');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        p.*,
        c.nombre AS categoria_nombre
      FROM Producto p
      LEFT JOIN Categoria c ON p.categoria_id = c.id
      ${whereClause}
      ORDER BY p.nombre ASC;
    `;

    return db.getAllSync<Producto>(query, params);
  }

  /**
   * Obtiene un producto por su identificador
   */
  static getById(id: number): Producto | null {
    const db = getDatabase();
    return (
      db.getFirstSync<Producto>(
        `SELECT 
          p.*,
          c.nombre AS categoria_nombre
        FROM Producto p
        LEFT JOIN Categoria c ON p.categoria_id = c.id
        WHERE p.id = ?;`,
        [id]
      ) || null
    );
  }

  /**
   * Registra un nuevo producto y genera su registro de auditoría
   */
  static create(data: ProductoInput, usuario: string = 'admin'): Producto {
    const db = getDatabase();

    if (data.precio_venta <= data.precio_compra) {
      throw new Error('El precio de venta debe ser superior al precio de compra.');
    }
    if (data.stock < 0) {
      throw new Error('El stock no puede ser un valor negativo.');
    }

    let createdId = 0;

    db.withTransactionSync(() => {
      const result = db.runSync(
        `INSERT INTO Producto (
          categoria_id, nombre, descripcion, precio_compra, precio_venta, stock, stock_minimo, imagen_uri, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1);`,
        [
          data.categoria_id,
          data.nombre.trim(),
          data.descripcion?.trim() || null,
          data.precio_compra,
          data.precio_venta,
          data.stock,
          data.stock_minimo ?? 5,
          data.imagen_uri || null,
        ]
      );
      createdId = result.lastInsertRowId;

      AuditService.log(
        'Producto',
        createdId,
        'CREATE',
        usuario,
        `Creación de producto '${data.nombre}' con stock inicial ${data.stock}`
      );
    });

    const created = this.getById(createdId);
    if (!created) {
      throw new Error('No se pudo recuperar el producto recién creado.');
    }
    return created;
  }

  /**
   * Actualiza los datos de un producto y audita el cambio
   */
  static update(id: number, data: Partial<ProductoInput>, usuario: string = 'admin'): Producto {
    const db = getDatabase();
    const actual = this.getById(id);
    if (!actual) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    const nuevoPrecioCompra = data.precio_compra ?? actual.precio_compra;
    const nuevoPrecioVenta = data.precio_venta ?? actual.precio_venta;

    if (nuevoPrecioVenta <= nuevoPrecioCompra) {
      throw new Error('El precio de venta debe ser superior al precio de compra.');
    }

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.categoria_id !== undefined) {
      updates.push('categoria_id = ?');
      params.push(data.categoria_id);
    }
    if (data.nombre !== undefined) {
      updates.push('nombre = ?');
      params.push(data.nombre.trim());
    }
    if (data.descripcion !== undefined) {
      updates.push('descripcion = ?');
      params.push(data.descripcion ? data.descripcion.trim() : null);
    }
    if (data.precio_compra !== undefined) {
      updates.push('precio_compra = ?');
      params.push(data.precio_compra);
    }
    if (data.precio_venta !== undefined) {
      updates.push('precio_venta = ?');
      params.push(data.precio_venta);
    }
    if (data.stock !== undefined) {
      updates.push('stock = ?');
      params.push(data.stock);
    }
    if (data.stock_minimo !== undefined) {
      updates.push('stock_minimo = ?');
      params.push(data.stock_minimo);
    }
    if (data.imagen_uri !== undefined) {
      updates.push('imagen_uri = ?');
      params.push(data.imagen_uri || null);
    }

    if (updates.length > 0) {
      params.push(id);
      db.withTransactionSync(() => {
        db.runSync(
          `UPDATE Producto SET ${updates.join(', ')} WHERE id = ?;`,
          params
        );
        AuditService.log(
          'Producto',
          id,
          'UPDATE',
          usuario,
          `Actualización de campos: ${Object.keys(data).join(', ')}`
        );
      });
    }

    const updated = this.getById(id);
    if (!updated) {
      throw new Error('Error al recuperar producto actualizado.');
    }
    return updated;
  }

  /**
   * Borrado lógico del producto (activo = 0) para preservar integridad referencial de ventas
   */
  static deleteLogical(id: number, usuario: string = 'admin'): boolean {
    const db = getDatabase();
    const product = this.getById(id);
    if (!product) {
      throw new Error('El producto no existe.');
    }

    db.withTransactionSync(() => {
      db.runSync(`UPDATE Producto SET activo = 0 WHERE id = ?;`, [id]);
      AuditService.log(
        'Producto',
        id,
        'DELETE',
        usuario,
        `Borrado lógico del producto '${product.nombre}'`
      );
    });

    return true;
  }

  /**
   * Valida disponibilidad de inventario
   */
  static checkStockAvailable(productoId: number, requestedQty: number): { available: boolean; currentStock: number } {
    const db = getDatabase();
    const res = db.getFirstSync<{ stock: number }>(
      `SELECT stock FROM Producto WHERE id = ? AND activo = 1;`,
      [productoId]
    );

    const currentStock = res ? res.stock : 0;
    return {
      available: currentStock >= requestedQty,
      currentStock,
    };
  }
}

