import { getDatabase } from '../db/database';
import { AccionAuditoria, AuditLog } from '../types';

export class AuditService {
  /**
   * Registra una acción de auditoría en la base de datos
   */
  static log(
    entidad: string,
    entidad_id: number,
    accion: AccionAuditoria,
    usuario: string = 'usuario_activo',
    detalles?: string
  ): void {
    try {
      const db = getDatabase();
      db.runSync(
        `INSERT INTO AuditLog (entidad, entidad_id, accion, usuario, detalles)
         VALUES (?, ?, ?, ?, ?);`,
        [entidad, entidad_id, accion, usuario, detalles || null]
      );
    } catch (error) {
      console.error('Error al registrar log de auditoría:', error);
    }
  }

  /**
   * Obtiene los últimos registros de auditoría del sistema
   */
  static getRecentLogs(limit: number = 30): AuditLog[] {
    const db = getDatabase();
    return db.getAllSync<AuditLog>(
      `SELECT * FROM AuditLog ORDER BY id DESC LIMIT ?;`,
      [limit]
    );
  }

  /**
   * Obtiene la historia de auditoría de una entidad específica
   */
  static getLogsByEntity(entidad: string, entidad_id: number): AuditLog[] {
    const db = getDatabase();
    return db.getAllSync<AuditLog>(
      `SELECT * FROM AuditLog 
       WHERE entidad = ? AND entidad_id = ? 
       ORDER BY id DESC;`,
      [entidad, entidad_id]
    );
  }
}

