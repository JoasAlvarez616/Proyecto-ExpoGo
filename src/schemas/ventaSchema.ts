import { z } from 'zod';

export const DetalleVentaItemSchema = z.object({
  producto_id: z
    .number({ required_error: 'ID de producto requerido' })
    .positive('Producto inválido'),
  cantidad: z
    .number({ invalid_type_error: 'La cantidad debe ser numérica' })
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad mínima a vender es 1'),
  precio_unitario: z
    .number()
    .positive('El precio unitario debe ser positivo'),
  subtotal: z
    .number()
    .positive('El subtotal debe ser positivo'),
});

export const VentaSchema = z.object({
  cliente_id: z
    .number({ required_error: 'Debes seleccionar un cliente' })
    .positive('Debes seleccionar un cliente válido'),
  items: z
    .array(DetalleVentaItemSchema)
    .min(1, 'La venta debe contener al menos un producto en el carrito'),
  estado: z
    .enum(['pendiente', 'pagada', 'anulada'])
    .default('pagada'),
});

export type VentaFormData = z.infer<typeof VentaSchema>;

