import { useState, useCallback } from 'react';
import { facturasAPI, FacturasFilters } from '../services/api';
import type { Factura, FacturasResponse } from '../types';

interface FacturasState {
  facturas: Factura[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const useFacturas = () => {
  const [state, setState] = useState<FacturasState>({
    facturas: [],
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 50, pages: 0 },
  });

  const getAll = useCallback(
    async (filters?: FacturasFilters, page: number = 1, limit: number = 50) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await facturasAPI.getAll(filters, page, limit);
        setState({
          facturas: response.facturas,
          pagination: response.pagination,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err?.response?.data?.message || 'Error cargando facturas',
        }));
      }
    },
    [],
  );

  const getById = useCallback(async (id: string): Promise<Factura | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await facturasAPI.getById(id);
      setState((prev) => ({ ...prev, loading: false }));
      return response.factura;
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || 'Error cargando factura',
      }));
      return null;
    }
  }, []);

  const create = useCallback(async (data: Omit<Factura, 'id' | 'usuario_id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Factura | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await facturasAPI.create(data);
      setState((prev) => ({
        ...prev,
        facturas: [response.factura, ...prev.facturas],
        loading: false,
      }));
      return response.factura;
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || 'Error creando factura',
      }));
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Factura>): Promise<Factura | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await facturasAPI.update(id, data);
      setState((prev) => ({
        ...prev,
        facturas: prev.facturas.map((f) => (f.id === id ? response.factura : f)),
        loading: false,
      }));
      return response.factura;
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || 'Error actualizando factura',
      }));
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await facturasAPI.delete(id);
      setState((prev) => ({
        ...prev,
        facturas: prev.facturas.filter((f) => f.id !== id),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || 'Error eliminando factura',
      }));
      return false;
    }
  }, []);

  return {
    ...state,
    getAll,
    getById,
    create,
    update,
    delete: remove,
  };
};
