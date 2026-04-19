import { useState } from 'react';
import { z } from 'zod';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  rnc: string;
  empresa: string;
}

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Al menos 1 mayúscula')
      .regex(/[0-9]/, 'Al menos 1 número'),
    confirmPassword: z.string(),
    nombre: z.string().min(3, 'Mínimo 3 caracteres'),
    rnc: z
      .string()
      .regex(/^\d{9}$/, 'RNC debe ser 9 dígitos')
      .optional()
      .or(z.literal('')),
    empresa: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export default function AuthForm({ type, onSubmit, isLoading }: AuthFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    rnc: '',
    empresa: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const schema = type === 'login' ? loginSchema : registerSchema;
    const validation = schema.safeParse(formData);

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!newErrors[field]) newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch {
      // Error manejado en la página padre
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          disabled={isLoading}
          autoComplete="email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      {type === 'register' && (
        <>
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              disabled={isLoading}
              autoComplete="name"
            />
            {errors.nombre && <span className="error">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="rnc">RNC (Opcional)</label>
            <input
              id="rnc"
              type="text"
              name="rnc"
              value={formData.rnc}
              onChange={handleChange}
              placeholder="123456789"
              disabled={isLoading}
              maxLength={9}
            />
            {errors.rnc && <span className="error">{errors.rnc}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="empresa">Empresa (Opcional)</label>
            <input
              id="empresa"
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              placeholder="Tu empresa"
              disabled={isLoading}
              autoComplete="organization"
            />
            {errors.empresa && <span className="error">{errors.empresa}</span>}
          </div>
        </>
      )}

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={isLoading}
          autoComplete={type === 'login' ? 'current-password' : 'new-password'}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      {type === 'register' && (
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn btn-primary">
        {isLoading ? 'Cargando...' : type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
      </button>
    </form>
  );
}
