import type { User, AuthResponse, Factura, FacturasResponse, FacturaResponse } from '../types';
export declare const authAPI: {
    register: (email: string, password: string, nombre: string, rnc?: string, empresa?: string) => Promise<AuthResponse>;
    login: (email: string, password: string) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    getMe: () => Promise<{
        user: User;
    }>;
};
export interface FacturasFilters {
    estado?: string;
    tipo_factura?: string;
    rnc_proveedor?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    sort?: string;
}
export declare const facturasAPI: {
    getAll: (filters?: FacturasFilters, page?: number, limit?: number) => Promise<FacturasResponse>;
    getById: (id: string) => Promise<FacturaResponse>;
    create: (factura: Omit<Factura, "id" | "usuario_id" | "created_at" | "updated_at" | "deleted_at">) => Promise<FacturaResponse>;
    update: (id: string, updates: Partial<Factura>) => Promise<FacturaResponse>;
    delete: (id: string) => Promise<{
        message: string;
    }>;
};
export declare const reportesAPI: {
    generate606: (mes: number, anio: number, filters?: {
        estado?: string;
        tipo_factura?: string;
    }) => Promise<{
        blob: Blob;
        filename: string;
        filas: number;
    }>;
};
//# sourceMappingURL=api.d.ts.map