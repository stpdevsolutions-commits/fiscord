import axios from 'axios';
const apiClient = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
export const authAPI = {
    register: async (email, password, nombre, rnc, empresa) => {
        const { data } = await apiClient.post('/auth/register', {
            email,
            password,
            nombre,
            rnc: rnc || undefined,
            empresa: empresa || undefined,
        });
        return data;
    },
    login: async (email, password) => {
        const { data } = await apiClient.post('/auth/login', { email, password });
        return data;
    },
    logout: async () => {
        await apiClient.post('/auth/logout');
    },
    getMe: async () => {
        const { data } = await apiClient.get('/auth/me');
        return data;
    },
};
export const facturasAPI = {
    getAll: async (filters, page = 1, limit = 50) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (filters?.estado)
            params.append('estado', filters.estado);
        if (filters?.tipo_factura)
            params.append('tipo_factura', filters.tipo_factura);
        if (filters?.rnc_proveedor)
            params.append('rnc_proveedor', filters.rnc_proveedor);
        if (filters?.fecha_desde)
            params.append('fecha_desde', filters.fecha_desde);
        if (filters?.fecha_hasta)
            params.append('fecha_hasta', filters.fecha_hasta);
        if (filters?.sort)
            params.append('sort', filters.sort);
        const { data } = await apiClient.get(`/facturas?${params.toString()}`);
        return data;
    },
    getById: async (id) => {
        const { data } = await apiClient.get(`/facturas/${id}`);
        return data;
    },
    create: async (factura) => {
        const { data } = await apiClient.post('/facturas', factura);
        return data;
    },
    update: async (id, updates) => {
        const { data } = await apiClient.put(`/facturas/${id}`, updates);
        return data;
    },
    delete: async (id) => {
        const { data } = await apiClient.delete(`/facturas/${id}`);
        return data;
    },
};
export const reportesAPI = {
    generate606: async (mes, anio, filters) => {
        const response = await apiClient.post('/reportes/606/generate', { mes, anio, ...filters }, { responseType: 'blob' });
        const disposition = response.headers['content-disposition'];
        const filas = parseInt(response.headers['x-606-filas'] ?? '0', 10);
        const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] ??
            `DGII_606_${anio}${String(mes).padStart(2, '0')}.xlsx`;
        return { blob: response.data, filename, filas };
    },
};
//# sourceMappingURL=api.js.map