import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Al menos 1 mayúscula')
    .regex(/[0-9]/, 'Al menos 1 número'),
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  rnc: z
    .string()
    .regex(/^\d{9}$/, 'RNC debe ser 9 dígitos')
    .optional(),
  empresa: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
