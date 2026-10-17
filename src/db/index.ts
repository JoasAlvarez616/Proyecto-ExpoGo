import { getDatabase } from './database';
import { runMigrations } from './migrations';
import { runSeeds } from './seeds';

export function initDatabase(): void {
  try {
    // Asegurar inicialización y conexión
    getDatabase();
    // Ejecutar DDL
    runMigrations();
    // Sembrar datos iniciales si no existen
    runSeeds();
  } catch (error) {
    console.error('Error fatal al inicializar SQLite:', error);
    throw error;
  }
}

export * from './database';
export * from './migrations';
export * from './seeds';

