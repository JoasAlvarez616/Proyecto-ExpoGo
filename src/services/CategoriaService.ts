import { getDatabase } from '../db/database';
import { Categoria } from '../types';

export class CategoriaService {
  static getAll(): Categoria[] {
    const db = getDatabase();
    return db.getAllSync<Categoria>(
      `SELECT * FROM Categoria ORDER BY nombre ASC;`
    );
  }

  static getById(id: number): Categoria | null {
    const db = getDatabase();
    return (
      db.getFirstSync<Categoria>(
        `SELECT * FROM Categoria WHERE id = ?;`,
        [id]
      ) || null
    );
  }
}

