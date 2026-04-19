import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';
export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleRegister = async (data) => {
        try {
            setIsLoading(true);
            setError(null);
            await register(data.email, data.password, data.nombre, data.rnc, data.empresa);
            navigate('/dashboard');
        }
        catch (err) {
            const message = err.response?.data?.message ||
                'Error en registro';
            setError(message);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h1", { children: "FiscoRD" }), _jsx("p", { className: "subtitle", children: "Crea tu cuenta" }), error && _jsx("div", { className: "alert alert-error", children: error }), _jsx(AuthForm, { type: "register", onSubmit: handleRegister, isLoading: isLoading }), _jsxs("p", { className: "auth-link", children: ["\u00BFYa tienes cuenta?", ' ', _jsx("a", { onClick: () => navigate('/login'), children: "Inicia sesi\u00F3n" })] })] }) }));
}
//# sourceMappingURL=RegisterPage.js.map