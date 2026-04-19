import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
export function useAuth() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            const savedToken = localStorage.getItem('authToken');
            if (savedToken) {
                setToken(savedToken);
                const response = await authAPI.getMe();
                setUser(response.user);
            }
        }
        catch {
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    const register = async (email, password, nombre, rnc, empresa) => {
        try {
            setError(null);
            const response = await authAPI.register(email, password, nombre, rnc, empresa);
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem('authToken', response.token);
        }
        catch (err) {
            const message = err.response?.data?.message ||
                'Error en registro';
            setError(message);
            throw err;
        }
    };
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authAPI.login(email, password);
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem('authToken', response.token);
        }
        catch (err) {
            const message = err.response?.data?.message ||
                'Error en login';
            setError(message);
            throw err;
        }
    };
    const logout = async () => {
        try {
            await authAPI.logout();
        }
        catch (err) {
            console.error('Error en logout:', err);
        }
        finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('authToken');
        }
    };
    return { user, token, loading, error, register, login, logout, checkAuth };
}
//# sourceMappingURL=useAuth.js.map