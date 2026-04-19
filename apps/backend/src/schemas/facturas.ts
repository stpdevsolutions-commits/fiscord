import { z } from 'zod';

export const createFacturaSchema = z.object({
  ncf: z
    .string()
    .regex(/^\d{19}$/, 'NCF debe ser 19 dígitos'),
  rnc_proveedor: z
    .string()
    .regex(/^\d{9}$/, 'RNC del proveedor debe ser 9 dígitos'),
  tipo_factura: z
    .string()
    .min(1, 'Tipo de factura requerido'),
  monto: z
    .number()
    .positive('Monto debe ser positivo'),
  itbis: z
    .number()
    .nonnegative('ITBIS no puede ser negativo')
    .optional(),
  isr: z
    .number()
    .nonnegative('ISR no puede ser negativo')
    .optional(),
  fecha_factura: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD'),
  fecha_vencimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD')
    .optional(),
  descripcion: z
    .string()
    .optional(),
  foto_url: z
    .string()
    .url('URL de foto inválida')
    .optional(),
});

export type CreateFacturaInput = z.infer<typeof createFacturaSchema>;
