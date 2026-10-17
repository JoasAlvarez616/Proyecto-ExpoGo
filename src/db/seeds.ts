import { getDatabase } from './database';

export function runSeeds(): void {
  const db = getDatabase();

  // Verificar si ya hay datos en categorías
  const countResult = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM Categoria;'
  );

  if (countResult && countResult.count > 0) {
    // Ya existen datos sembrados
    return;
  }

  db.withTransactionSync(() => {
    // 1. Sembrar Categorías
    db.runSync(`
      INSERT INTO Categoria (id, nombre, descripcion) VALUES
      (1, 'Electrónica & Audio', 'Dispositivos inteligentes, audio de alta fidelidad y accesorios tech'),
      (2, 'Computación & Oficina', 'Periféricos ergonómicos, monitores y productividad'),
      (3, 'Lifestyle & Accesorios', 'Mochilas, termos y equipamiento diario'),
      (4, 'Deportes & Bienestar', 'Relojes deportivos y accesorios de entrenamiento');
    `);

    // 2. Sembrar Productos Iniciales
    db.runSync(`
      INSERT INTO Producto (id, categoria_id, nombre, descripcion, precio_compra, precio_venta, stock, stock_minimo, imagen_uri, activo) VALUES
      (1, 1, 'Auriculares Pro ANC', 'Cancelación activa de ruido, 40h de batería, Bluetooth 5.3', 180000, 289900, 15, 5, null, 1),
      (2, 4, 'Smartwatch Titan Pro', 'Pantalla AMOLED 1.43", GPS integrado, sensor SpO2', 220000, 379900, 3, 5, null, 1),
      (3, 2, 'Teclado Mecánico 75% RGB', 'Switches ópticos táctiles, hotswappable, keycaps PBT', 140000, 239900, 22, 6, null, 1),
      (4, 3, 'Mochila Impermeable Urban', 'Compartimento para laptop 16", puerto USB, tejido Cordura', 85000, 149900, 8, 4, null, 1),
      (5, 3, 'Botella Térmica 1000ml', 'Acero inoxidable 304 doble pared, mantiene frío 24h', 35000, 69900, 2, 6, null, 1),
      (6, 2, 'Lámpara Monitor LED Pro', 'Sin reflejo en pantalla, control táctil, temperatura de luz regulable', 95000, 169900, 12, 4, null, 1),
      (7, 2, 'Mouse Ergonómico Vertical', 'Sensor óptico 4000 DPI, reduce fatiga del túnel carpiano', 65000, 119900, 18, 5, null, 1),
      (8, 1, 'Monitor Portátil 15.6" FHD', 'Panel IPS ultrafino, entrada Type-C y HDMI mini, altavoces', 390000, 599900, 4, 5, null, 1);
    `);

    // 3. Sembrar Clientes
    db.runSync(`
      INSERT INTO Cliente (id, nombre, email, telefono, direccion) VALUES
      (1, 'Carlos Andrés Mendoza', 'carlos.mendoza@email.com', '+57 312 456 7890', 'Calle 72 # 11-45, Bogotá'),
      (2, 'Valentina Ríos Castro', 'valentina.rios@email.com', '+57 301 987 6543', 'Cra 43A # 1-50, Medellín'),
      (3, 'Andrés Felipe Gómez', 'andres.gomez@email.com', '+57 315 222 3344', 'Av. San Juan # 65-12, Cali'),
      (4, 'Mariana Sofía López', 'mariana.lopez@email.com', '+57 320 555 8899', 'Calle 100 # 15-20, Barranquilla');
    `);

    // 4. Sembrar Ventas Históricas
    // Venta 1: Pagada
    db.runSync(`
      INSERT INTO Venta (id, cliente_id, fecha, subtotal, impuesto, total, estado)
      VALUES (1, 1, datetime('now', '-2 days'), 529800, 100662, 630462, 'pagada');
    `);
    db.runSync(`
      INSERT INTO DetalleVenta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES
      (1, 1, 1, 289900, 289900),
      (1, 3, 1, 239900, 239900);
    `);

    // Venta 2: Pendiente
    db.runSync(`
      INSERT INTO Venta (id, cliente_id, fecha, subtotal, impuesto, total, estado)
      VALUES (2, 2, datetime('now', '-5 hours'), 379900, 72181, 452081, 'pendiente');
    `);
    db.runSync(`
      INSERT INTO DetalleVenta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES
      (2, 2, 1, 379900, 379900);
    `);

    // Venta 3: Pagada
    db.runSync(`
      INSERT INTO Venta (id, cliente_id, fecha, subtotal, impuesto, total, estado)
      VALUES (3, 3, datetime('now', '-1 days'), 319800, 60762, 380562, 'pagada');
    `);
    db.runSync(`
      INSERT INTO DetalleVenta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES
      (3, 4, 1, 149900, 149900),
      (3, 6, 1, 169900, 169900);
    `);

    // 5. Sembrar Registros de Auditoría
    db.runSync(`
      INSERT INTO AuditLog (entidad, entidad_id, accion, usuario, detalles)
      VALUES
      ('Producto', 1, 'CREATE', 'admin@sistema.com', 'Sembrado inicial de producto: Auriculares Pro ANC'),
      ('Producto', 2, 'CREATE', 'admin@sistema.com', 'Sembrado inicial de producto: Smartwatch Titan Pro'),
      ('Cliente', 1, 'CREATE', 'admin@sistema.com', 'Registro inicial de cliente: Carlos Andrés Mendoza'),
      ('Venta', 1, 'CREATE', 'cajero_1', 'Venta inicial registrada #1 por valor de 630462');
    `);
  });
}

