import type { Factura } from '../types';
interface FacturasTableProps {
    facturas: Factura[];
    loading: boolean;
    onDelete: (id: string) => void;
    onEdit: (factura: Factura) => void;
}
export declare const FacturasTable: ({ facturas, loading, onDelete, onEdit }: FacturasTableProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FacturasTable.d.ts.map