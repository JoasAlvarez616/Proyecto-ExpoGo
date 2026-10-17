import { getDatabase } from './database';

export function runMigrations(): void {
  const db = getDatabase();

  db.execSync(`
    -- 1. Tabla de Categorías
    CREATE TABLE IF NOT EXISTS Categoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Tabla de Productos
    CREATE TABLE IF NOT EXISTS Producto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio_compra REAL NOT NULL,
      precio_venta REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      stock_minimo INTEGER DEFAULT 5,
      imagen_uri TEXT,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (categoria_id) REFERENCES Categoria(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    -- 3. Tabla de Clientes
    CREATE TABLE IF NOT EXISTS Cliente (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telefono TEXT,
      direccion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Tabla de Ventas (Cabecera)
    CREATE TABLE IF NOT EXISTS Venta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      subtotal REAL NOT NULL,
      impuesto REAL NOT NULL,
      total REAL NOT NULL,
      estado TEXT CHECK(estado IN ('pendiente','pagada','anulada')) DEFAULT 'pagada',
      FOREIGN KEY (cliente_id) REFERENCES Cliente(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    -- 5. Tabla de DetalleVenta
    CREATE TABLE IF NOT EXISTS DetalleVenta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venta_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (venta_id) REFERENCES Venta(id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES Producto(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    -- 6. Tabla de Auditoría
    CREATE TABLE IF NOT EXISTS AuditLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entidad TEXT NOT NULL,
      entidad_id INTEGER NOT NULL,
      accion TEXT CHECK(accion IN ('CREATE','UPDATE','DELETE')) NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      usuario TEXT NOT NULL,
      detalles TEXT
    );

    -- Índices para optimización de consultas
    CREATE INDEX IF NOT EXISTS idx_producto_activo ON Producto(activo);
    CREATE INDEX IF NOT EXISTS idx_producto_categoria ON Producto(categoria_id);
    CREATE INDEX IF NOT EXISTS idx_producto_stock ON Producto(stock);
    CREATE INDEX IF NOT EXISTS idx_venta_cliente ON Venta(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_venta_fecha ON Venta(fecha);
    CREATE INDEX IF NOT EXISTS idx_venta_estado ON Venta(estado);
    CREATE INDEX IF NOT EXISTS idx_detalle_venta ON DetalleVenta(venta_id);
    CREATE INDEX IF NOT EXISTS idx_audit_entidad ON AuditLog(entidad, entidad_id);
  `);
}

