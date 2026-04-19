import { useState, useCallback } from 'react';
import { facturasAPI } from '../services/api';
export const useFacturas = () => {
    const [state, setState] = useState({
        facturas: [],
        loading: false,
        error: null,
        pagination: { total: 0, page: 1, limit: 50, pages: 0 },
    });
    const getAll = useCallback(async (filters, page = 1, limit = 50) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await facturasAPI.getAll(filters, page, limit);
            setState({
                facturas: response.facturas,
                pagination: response.pagination,
                loading: false,
                error: null,
            });
        }
        catch (err) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: err?.response?.data?.message || 'Error cargando facturas',
            }));
        }
    }, []);
    const getById = useCallback(async (id) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await facturasAPI.getById(id);
            setState((prev) => ({ ...prev, loading: false }));
            return response.factura;
        }
        catch (err) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: err?.response?.data?.message || 'Error cargando factura',
            }));
            return null;
        }
    }, []);
    const create = useCallback(async (data) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await facturasAPI.create(data);
            setState((prev) => ({
                ...prev,
                facturas: [response.factura, ...prev.facturas],
                loading: false,
            }));
            return response.factura;
        }
        catch (err) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: err?.response?.data?.message || 'Error creando factura',
            }));
            return null;
        }
    }, []);
    const update = useCallback(async (id, data) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await facturasAPI.update(id, data);
            setState((prev) => ({
                ...prev,
                facturas: prev.facturas.map((f) => (f.id === id ? response.factura : f)),
                loading: false,
            }));
            return response.factura;
        }
        catch (err) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: err?.response?.data?.message || 'Error actualizando factura',
            }));
            return null;
        }
    }, []);
    const remove = useCallback(async (id) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            await facturasAPI.delete(id);
            setState((prev) => ({
                ...prev,
                facturas: prev.facturas.filter((f) => f.id !== id),
                loading: false,
            }));
            return true;
        }
        catch (err) {
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
//# sourceMappingURL=useFacturas.js.map