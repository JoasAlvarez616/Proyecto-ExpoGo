# LIBRETO DE CONSTRUCCIÓN DEL SISTEMA
## ComercioPro — Aplicación de Compra y Venta

**Proyecto:** ComercioPro
**Tecnología:** React Native + Expo Go
**Lenguaje:** TypeScript
**Persistencia:** SQLite local
**Autor:** Joás Alvarez
**Fecha:** 17/10/2026

---

## 1. Objetivo del sistema

Construir una aplicación móvil que permita a un pequeño comercio **registrar productos, gestionar clientes y emitir facturas de venta**, guardando toda la información directamente en el celular y funcionando **sin conexión a internet**.

La aplicación debía cubrir las cuatro operaciones básicas de cualquier sistema comercial — **crear, consultar, actualizar y eliminar** — aplicadas a tres entidades: productos, clientes y ventas.

---

## 2. Alcance del proyecto

La aplicación debía permitir:

- Registrar, editar y desactivar **productos**, con precio de compra, precio de venta y stock.
- Registrar, editar y eliminar **clientes**, con nombre, correo, teléfono y dirección.
- Emitir **facturas de venta**, calculando automáticamente el IVA del 19% y descontando el inventario.
- **Anular facturas**, devolviendo automáticamente los productos al inventario.
- Consultar un **panel de control** con métricas del negocio (ventas del día, ventas del mes, productos con stock bajo y últimas transacciones).
- Mantener un **registro de auditoría** de todas las operaciones importantes.

La aplicación **no** incluiría: usuarios con contraseña, sincronización con la nube, facturación electrónica ante la DIAN ni envío de correos.

---

## 3. Metodología de construcción

El proyecto se construyó en **cinco fases**, cada una con un entregable concreto.

### Fase 1 — Definición de datos

Se decidió qué entidades necesitaba el sistema y qué información guardaría cada una:

- **Categoría** → agrupa los productos.
- **Producto** → nombre, precios, stock y stock mínimo.
- **Cliente** → datos de contacto.
- **Venta** y **Detalle de venta** → cabecera de la factura y sus productos.
- **Registro de auditoría** → quién hizo qué y cuándo.

Con estas entidades se definió el modelo relacional antes de escribir una sola pantalla.

### Fase 2 — Construcción de la base de datos

Se creó una base de datos **SQLite local** con todas las tablas, relaciones y claves foráneas activas. Se incluyeron **datos de ejemplo** (categorías, productos, clientes y ventas iniciales) para que la app arrancara con contenido demostrable.

También se definieron las reglas de negocio desde este momento:

- Un producto **no puede venderse más de lo que hay en stock**.
- Al **anular una venta**, el stock se devuelve automáticamente.
- Los **productos no se borran** físicamente, solo se desactivan (para no romper el historial de ventas).
- Los **clientes solo se pueden borrar** si no tienen facturas asociadas.

### Fase 3 — Construcción de la lógica de negocio

Antes de construir pantallas, se construyeron los **servicios** (una capa intermedia entre la base de datos y la interfaz). Cada servicio se encarga de una entidad y centraliza sus reglas:

- **ProductoService** → crear, editar, desactivar, verificar stock.
- **ClienteService** → crear, editar, eliminar con validación de facturas.
- **VentaService** → emitir factura, anular factura, calcular totales, generar métricas del panel.
- **AuditService** → registrar toda operación sensible.

Esta separación permite que la lógica funcione **incluso sin interfaz** (se puede probar de forma aislada).

### Fase 4 — Construcción de la interfaz

Con la base y los servicios listos, se construyeron las pantallas:

- **Panel principal** con métricas y accesos rápidos.
- **Inventario** con búsqueda, filtros por categoría y alertas de stock bajo.
- **Clientes** con estadísticas de consumo.
- **Historial de ventas** con filtros por estado.
- **Formularios** de producto, cliente y venta.
- **Detalles** de producto y de factura.

Los formularios se construyeron con **validación en tiempo real**, de forma que el usuario no pudiera guardar precios negativos, venta menor que compra, correos inválidos o cantidades que excedan el stock.

### Fase 5 — Integración, diseño final y pruebas

En esta última fase se unificó todo:

- Se aplicó el **diseño visual** (paleta de colores, tipografía, tarjetas, botones).
- Se añadieron **animaciones** de entrada, transiciones entre pantallas y respuesta táctil.
- Se configuró el **cambio de tema** oscuro/claro.
- Se probaron los cuatro flujos principales: crear producto, crear cliente, emitir venta y anular venta.
- Se verificó que la app funcionara **sin internet** y con la base de datos vacía.

---

## 4. Arquitectura general del sistema

El sistema se organiza en **cuatro capas**, cada una con una responsabilidad clara:

| Capa | Responsabilidad |
|---|---|
| **Pantallas** | Lo que el usuario ve y toca. |
| **Hooks** | Pequeñas funciones que conectan la pantalla con la lógica. |
| **Servicios** | Reglas de negocio y validaciones. |
| **Base de datos** | Guardar y recuperar la información en SQLite. |

Esta separación es lo que permite que el proyecto sea **mantenible**: si mañana cambia una regla de negocio, solo se toca la capa de servicios; si cambia la interfaz, solo se toca la capa de pantallas.

---

## 5. Estándares aplicados

El proyecto se construyó siguiendo **buenas prácticas de desarrollo de software** reconocidas, tanto internacionales como nacionales, **sin que esto implicara complejidad innecesaria**:

- **Separación de responsabilidades:** cada parte del sistema hace una sola cosa.
- **Validación de datos:** ningún dato inválido entra al sistema.
- **Trazabilidad:** toda operación destructiva queda registrada en auditoría.
- **Integridad de la información:** las transacciones importantes son atómicas (se completan o no se hacen).
- **Cálculo correcto del IVA (19%)** conforme a la normativa colombiana.
- **Funcionamiento offline**, sin depender de servicios externos.
- **Código limpio y tipado** con TypeScript.

Se evitó intencionalmente implementar marcos normativos completos (como certificaciones o auditorías formales), priorizando **que la aplicación funcionara correctamente y fuera entendible**.

---

## 6. Entregables

Al finalizar el proyecto se entregan:

1. **Aplicación funcional** ejecutable en Expo Go.
2. **Código fuente** organizado en carpetas (`app/`, `src/`, etc.).
3. **Base de datos** con datos de ejemplo precargados.
4. **Documentación** con instrucciones para ejecutar la app.
5. **Este libretto** como registro del proceso de construcción.

---

## 7. Conclusión

**ComercioPro** se construyó siguiendo un proceso ordenado: primero se definieron los datos, luego se construyó la base, después la lógica de negocio, y solo al final la interfaz. Este orden permitió que cada pieza se probara por separado y que la aplicación final fuera **funcional, comprensible y mantenible**.

El resultado es una aplicación que resuelve un problema real de un pequeño comercio, funciona sin internet y sigue buenas prácticas de desarrollo sin caer en complejidad innecesaria.