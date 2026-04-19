import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { storage } from '../services/storage';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await storage.getToken();
        if (token) {
          const { user } = await authAPI.getMe();
          setUser(user);
        }
      } catch {
        await storage.removeToken();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      await storage.setToken(res.token);
      setUser(res.user);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, nombre: string, rnc?: string, empresa?: string) => {
      setError(null);
      setLoading(true);
      try {
        const res = await authAPI.register(email, password, nombre, rnc, empresa);
        await storage.setToken(res.token);
        setUser(res.user);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error al registrarse';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    await storage.removeToken();
    setUser(null);
  }, []);

  return { user, loading, error, login, register, logout };
}
