import { z } from 'zod';

export const createFacturaSchema = z.object({
  ncf: z
    .string()
    .length(20, 'NCF debe ser 20 caracteres')
    .regex(/^[EB]\d{19}$/, 'NCF inválido — debe iniciar con E o B seguido de 19 dígitos'),
  rnc_proveedor: z
    .string()
    .length(9, 'RNC debe ser 9 dígitos')
    .regex(/^\d{9}$/, 'RNC debe contener solo números'),
  tipo_factura: z.enum(['E31', 'E32', 'E33', 'B01', 'B02', 'B03', 'B04'], {
    errorMap: () => ({ message: 'Tipo de factura inválido' }),
  }),
  monto: z.number().positive('Monto debe ser mayor a 0'),
  itbis: z.number().min(0, 'ITBIS no puede ser negativo').optional(),
  isr: z.number().min(0, 'ISR no puede ser negativo').optional(),
  fecha_factura: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida — use YYYY-MM-DD')),
  fecha_vencimiento: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida — use YYYY-MM-DD'))
    .optional(),
  descripcion: z.string().max(500, 'Descripción máximo 500 caracteres').optional(),
  foto_url: z.string().url('URL de foto inválida').optional(),
});

export const updateFacturaSchema = createFacturaSchema.partial();

export type CreateFacturaInput = z.infer<typeof createFacturaSchema>;
export type UpdateFacturaInput = z.infer<typeof updateFacturaSchema>;
