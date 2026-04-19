import { useState, useEffect, useCallback } from 'react';
import type { User, AuthResponse } from '../types';
import { authAPI } from '../services/api';

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, nombre: string, rnc?: string, empresa?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        setToken(savedToken);
        const response = await authAPI.getMe();
        setUser(response.user);
      }
    } catch {
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const register = async (
    email: string,
    password: string,
    nombre: string,
    rnc?: string,
    empresa?: string,
  ): Promise<void> => {
    try {
      setError(null);
      const response: AuthResponse = await authAPI.register(email, password, nombre, rnc, empresa);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Error en registro';
      setError(message);
      throw err;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      const response: AuthResponse = await authAPI.login(email, password);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Error en login';
      setError(message);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Error en logout:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  return { user, token, loading, error, register, login, logout, checkAuth };
}
