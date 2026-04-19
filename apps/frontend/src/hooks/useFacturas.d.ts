import { FacturasFilters } from '../services/api';
import type { Factura } from '../types';
export declare const useFacturas: () => {
    getAll: (filters?: FacturasFilters, page?: number, limit?: number) => Promise<void>;
    getById: (id: string) => Promise<Factura | null>;
    create: (data: Omit<Factura, "id" | "usuario_id" | "created_at" | "updated_at" | "deleted_at">) => Promise<Factura | null>;
    update: (id: string, data: Partial<Factura>) => Promise<Factura | null>;
    delete: (id: string) => Promise<boolean>;
    facturas: Factura[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
};
//# sourceMappingURL=useFacturas.d.ts.map