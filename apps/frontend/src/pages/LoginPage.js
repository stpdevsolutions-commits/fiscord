import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';
export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleLogin = async (data) => {
        try {
            setIsLoading(true);
            setError(null);
            await login(data.email, data.password);
            navigate('/dashboard');
        }
        catch (err) {
            const message = err.response?.data?.message ||
                'Email o contraseña incorrectos';
            setError(message);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h1", { children: "FiscoRD" }), _jsx("p", { className: "subtitle", children: "Inicia sesi\u00F3n" }), error && _jsx("div", { className: "alert alert-error", children: error }), _jsx(AuthForm, { type: "login", onSubmit: handleLogin, isLoading: isLoading }), _jsxs("p", { className: "auth-link", children: ["\u00BFNo tienes cuenta?", ' ', _jsx("a", { onClick: () => navigate('/register'), children: "Reg\u00EDstrate aqu\u00ED" })] })] }) }));
}
//# sourceMappingURL=LoginPage.js.map