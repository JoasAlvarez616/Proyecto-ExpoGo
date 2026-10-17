import { z } from 'zod';

export const ProductoSchema = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre es obligatorio' })
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(80, 'El nombre no puede exceder 80 caracteres'),
    categoria_id: z
      .number({ required_error: 'Debes seleccionar una categoría' })
      .int('Categoría inválida')
      .positive('Debes seleccionar una categoría válida'),
    descripcion: z
      .string()
      .max(250, 'La descripción no puede superar 250 caracteres')
      .optional()
      .or(z.literal('')),
    precio_compra: z
      .number({ invalid_type_error: 'El precio de compra debe ser un número' })
      .positive('El precio de compra debe ser mayor a 0'),
    precio_venta: z
      .number({ invalid_type_error: 'El precio de venta debe ser un número' })
      .positive('El precio de venta debe ser mayor a 0'),
    stock: z
      .number({ invalid_type_error: 'El stock debe ser un número' })
      .int('El stock debe ser un número entero')
      .min(0, 'El stock no puede ser negativo'),
    stock_minimo: z
      .number({ invalid_type_error: 'El stock mínimo debe ser un número' })
      .int('El stock mínimo debe ser entero')
      .min(0, 'El stock mínimo no puede ser negativo')
      .default(5),
    imagen_uri: z.string().optional().nullable(),
  })
  .refine((data) => data.precio_venta > data.precio_compra, {
    message: 'El precio de venta debe ser superior al precio de compra para asegurar rentabilidad',
    path: ['precio_venta'],
  });

export type ProductoFormData = z.infer<typeof ProductoSchema>;

