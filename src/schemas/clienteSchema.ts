import { z } from 'zod';

export const ClienteSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre completo es obligatorio' })
    .min(3, 'El nombre debe contener al menos 3 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres'),
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email('Ingresa un formato de correo electrónico válido (ej. cliente@empresa.com)'),
  telefono: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 dígitos')
    .regex(/^[+0-9\s-]+$/, 'El teléfono solo puede contener números, espacios y prefijo +')
    .optional()
    .or(z.literal('')),
  direccion: z
    .string()
    .max(150, 'La dirección no puede exceder 150 caracteres')
    .optional()
    .or(z.literal('')),
});

export type ClienteFormData = z.infer<typeof ClienteSchema>;
