import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('compra_venta.db');
    // Habilitar soporte de claves foráneas y modo WAL para mejor concurrencia
    dbInstance.execSync('PRAGMA foreign_keys = ON;');
    dbInstance.execSync('PRAGMA journal_mode = WAL;');
  }
  return dbInstance;
}

export function resetDatabaseInstance(): void {
  dbInstance = null;
}

