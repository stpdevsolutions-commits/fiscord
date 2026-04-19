import { useState, useCallback } from 'react';
import { facturasAPI, type FacturasFilters } from '../services/api';
import type { Factura, FacturasResponse } from '../types';

export function useFacturas() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async (filters?: FacturasFilters, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const res: FacturasResponse = await facturasAPI.getAll(filters, page, limit);
      setFacturas(res.facturas);
      setPagination(res.pagination);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error cargando facturas');
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string): Promise<Factura | null> => {
    setLoading(true);
    setError(null);
    try {
      return await facturasAPI.getById(id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error cargando factura');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (data: Omit<Factura, 'id' | 'usuario_id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Factura | null> => {
      setLoading(true);
      setError(null);
      try {
        const factura = await facturasAPI.create(data);
        setFacturas((prev) => [factura, ...prev]);
        return factura;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error creando factura');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const update = useCallback(async (id: string, data: Partial<Factura>): Promise<Factura | null> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await facturasAPI.update(id, data);
      setFacturas((prev) => prev.map((f) => (f.id === id ? updated : f)));
      return updated;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error actualizando factura');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await facturasAPI.delete(id);
      setFacturas((prev) => prev.filter((f) => f.id !== id));
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error eliminando factura');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { facturas, pagination, loading, error, getAll, getById, create, update, remove };
}
