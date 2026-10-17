import { getDatabase } from '../db/database';
import { Cliente, ClienteInput } from '../types';
import { AuditService } from './AuditService';

export class ClienteService {
  /**
   * Obtiene la lista de clientes con métricas calculadas de compras y ventas
   */
  static getAll(search?: string): Cliente[] {
    const db = getDatabase();
    let whereClause = '';
    const params: (string | number)[] = [];

    if (search && search.trim() !== '') {
      whereClause = 'WHERE (c.nombre LIKE ? OR c.email LIKE ? OR c.telefono LIKE ?)';
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern);
    }

    const query = `
      SELECT 
        c.*,
        COUNT(v.id) AS ventas_count,
        COALESCE(SUM(CASE WHEN v.estado = 'pagada' THEN v.total ELSE 0 END), 0) AS total_compras
      FROM Cliente c
      LEFT JOIN Venta v ON c.id = v.cliente_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.nombre ASC;
    `;

    return db.getAllSync<Cliente>(query, params);
  }

  /**
   * Obtiene un cliente por su ID
   */
  static getById(id: number): Cliente | null {
    const db = getDatabase();
    const query = `
      SELECT 
        c.*,
        COUNT(v.id) AS ventas_count,
        COALESCE(SUM(CASE WHEN v.estado = 'pagada' THEN v.total ELSE 0 END), 0) AS total_compras
      FROM Cliente c
      LEFT JOIN Venta v ON c.id = v.cliente_id
      WHERE c.id = ?
      GROUP BY c.id;
    `;
    return db.getFirstSync<Cliente>(query, [id]) || null;
  }

  /**
   * Registra un nuevo cliente validando unicidad de correo
   */
  static create(data: ClienteInput, usuario: string = 'admin'): Cliente {
    const db = getDatabase();
    const existing = db.getFirstSync<{ id: number }>(
      'SELECT id FROM Cliente WHERE LOWER(email) = LOWER(?);',
      [data.email.trim()]
    );

    if (existing) {
      throw new Error(`El correo ${data.email} ya se encuentra registrado.`);
    }

    let createdId = 0;
    db.withTransactionSync(() => {
      const res = db.runSync(
        `INSERT INTO Cliente (nombre, email, telefono, direccion)
         VALUES (?, ?, ?, ?);`,
        [
          data.nombre.trim(),
          data.email.trim().toLowerCase(),
          data.telefono?.trim() || null,
          data.direccion?.trim() || null,
        ]
      );
      createdId = res.lastInsertRowId;
      AuditService.log('Cliente', createdId, 'CREATE', usuario, `Nuevo cliente registrado: ${data.nombre}`);
    });

    const created = this.getById(createdId);
    if (!created) {
      throw new Error('Error al consultar cliente creado.');
    }
    return created;
  }

  /**
   * Actualiza los datos de un cliente
   */
  static update(id: number, data: Partial<ClienteInput>, usuario: string = 'admin'): Cliente {
    const db = getDatabase();
    const existing = this.getById(id);
    if (!existing) {
      throw new Error('Cliente no encontrado.');
    }

    if (data.email && data.email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const duplicate = db.getFirstSync<{ id: number }>(
        'SELECT id FROM Cliente WHERE LOWER(email) = LOWER(?) AND id != ?;',
        [data.email.trim(), id]
      );
      if (duplicate) {
        throw new Error(`El correo ${data.email} ya está en uso por otro cliente.`);
      }
    }

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.nombre !== undefined) {
      updates.push('nombre = ?');
      params.push(data.nombre.trim());
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(data.email.trim().toLowerCase());
    }
    if (data.telefono !== undefined) {
      updates.push('telefono = ?');
      params.push(data.telefono ? data.telefono.trim() : null);
    }
    if (data.direccion !== undefined) {
      updates.push('direccion = ?');
      params.push(data.direccion ? data.direccion.trim() : null);
    }

    if (updates.length > 0) {
      params.push(id);
      db.withTransactionSync(() => {
        db.runSync(`UPDATE Cliente SET ${updates.join(', ')} WHERE id = ?;`, params);
        AuditService.log('Cliente', id, 'UPDATE', usuario, `Datos actualizados: ${Object.keys(data).join(', ')}`);
      });
    }

    const updated = this.getById(id);
    if (!updated) {
      throw new Error('Error al consultar cliente actualizado.');
    }
    return updated;
  }

  /**
   * Borrado físico SOLO si el cliente no tiene ventas asociadas
   */
  static deletePhysical(id: number, usuario: string = 'admin'): { success: boolean; message: string } {
    const db = getDatabase();
    const client = this.getById(id);
    if (!client) {
      return { success: false, message: 'El cliente no existe.' };
    }

    // Comprobación de regla de negocio: no borrar clientes con historial de transacciones
    const salesCountRes = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM Venta WHERE cliente_id = ?;',
      [id]
    );

    const salesCount = salesCountRes ? salesCountRes.count : 0;
    if (salesCount > 0) {
      return {
        success: false,
        message: `No es posible eliminar a ${client.nombre} porque tiene ${salesCount} venta(s) registrada(s). Para preservar la contabilidad, el cliente no puede ser eliminado.`,
      };
    }

    db.withTransactionSync(() => {
      db.runSync('DELETE FROM Cliente WHERE id = ?;', [id]);
      AuditService.log('Cliente', id, 'DELETE', usuario, `Borrado físico de cliente: ${client.nombre}`);
    });

    return {
      success: true,
      message: `Cliente ${client.nombre} eliminado satisfactoriamente.`,
    };
  }
}

