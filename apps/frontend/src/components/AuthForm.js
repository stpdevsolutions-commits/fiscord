import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { z } from 'zod';
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
export default function AuthForm({ type, onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        rnc: '',
        empresa: '',
    });
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const schema = type === 'login' ? loginSchema : registerSchema;
        const validation = schema.safeParse(formData);
        if (!validation.success) {
            const newErrors = {};
            validation.error.issues.forEach((issue) => {
                const field = issue.path[0];
                if (!newErrors[field])
                    newErrors[field] = issue.message;
            });
            setErrors(newErrors);
            return;
        }
        try {
            await onSubmit(formData);
        }
        catch {
            // Error manejado en la página padre
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "auth-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", type: "email", name: "email", value: formData.email, onChange: handleChange, placeholder: "tu@email.com", disabled: isLoading, autoComplete: "email" }), errors.email && _jsx("span", { className: "error", children: errors.email })] }), type === 'register' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "nombre", children: "Nombre Completo" }), _jsx("input", { id: "nombre", type: "text", name: "nombre", value: formData.nombre, onChange: handleChange, placeholder: "Tu nombre", disabled: isLoading, autoComplete: "name" }), errors.nombre && _jsx("span", { className: "error", children: errors.nombre })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "rnc", children: "RNC (Opcional)" }), _jsx("input", { id: "rnc", type: "text", name: "rnc", value: formData.rnc, onChange: handleChange, placeholder: "123456789", disabled: isLoading, maxLength: 9 }), errors.rnc && _jsx("span", { className: "error", children: errors.rnc })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "empresa", children: "Empresa (Opcional)" }), _jsx("input", { id: "empresa", type: "text", name: "empresa", value: formData.empresa, onChange: handleChange, placeholder: "Tu empresa", disabled: isLoading, autoComplete: "organization" }), errors.empresa && _jsx("span", { className: "error", children: errors.empresa })] })] })), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "password", children: "Contrase\u00F1a" }), _jsx("input", { id: "password", type: "password", name: "password", value: formData.password, onChange: handleChange, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: isLoading, autoComplete: type === 'login' ? 'current-password' : 'new-password' }), errors.password && _jsx("span", { className: "error", children: errors.password })] }), type === 'register' && (_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "confirmPassword", children: "Confirmar Contrase\u00F1a" }), _jsx("input", { id: "confirmPassword", type: "password", name: "confirmPassword", value: formData.confirmPassword, onChange: handleChange, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: isLoading, autoComplete: "new-password" }), errors.confirmPassword && _jsx("span", { className: "error", children: errors.confirmPassword })] })), _jsx("button", { type: "submit", disabled: isLoading, className: "btn btn-primary", children: isLoading ? 'Cargando...' : type === 'login' ? 'Iniciar Sesión' : 'Registrarse' })] }));
}
//# sourceMappingURL=AuthForm.js.map