import axios from 'axios';
import { storage } from './storage';
import type { AuthResponse, Factura, FacturasResponse, OcrResult, User } from '../types';

const BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api'  // Android emulator → localhost
  : 'https://api.fiscord.com/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  register: async (
    email: string,
    password: string,
    nombre: string,
    rnc?: string,
    empresa?: string,
  ): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      nombre,
      rnc: rnc || undefined,
      empresa: empresa || undefined,
    });
    return data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const { data } = await apiClient.get<{ user: User }>('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

export interface FacturasFilters {
  estado?: string;
  tipo_factura?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export const facturasAPI = {
  getAll: async (filters?: FacturasFilters, page = 1, limit = 20): Promise<FacturasResponse> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo_factura) params.append('tipo_factura', filters.tipo_factura);
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    const { data } = await apiClient.get<FacturasResponse>(`/facturas?${params}`);
    return data;
  },

  getById: async (id: string): Promise<Factura> => {
    const { data } = await apiClient.get<{ factura: Factura }>(`/facturas/${id}`);
    return data.factura;
  },

  create: async (
    factura: Omit<Factura, 'id' | 'usuario_id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  ): Promise<Factura> => {
    const { data } = await apiClient.post<{ factura: Factura }>('/facturas', factura);
    return data.factura;
  },

  update: async (id: string, updates: Partial<Factura>): Promise<Factura> => {
    const { data } = await apiClient.put<{ factura: Factura }>(`/facturas/${id}`, updates);
    return data.factura;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/facturas/${id}`);
  },
};

export const ocrAPI = {
  scan: async (imageUri: string, mimeType = 'image/jpeg'): Promise<OcrResult> => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: mimeType,
      name: 'factura.jpg',
    } as unknown as Blob);

    const { data } = await apiClient.post<OcrResult>('/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
