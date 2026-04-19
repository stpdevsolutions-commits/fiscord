import type { Factura } from '../types';
interface FacturaFormProps {
    factura?: Factura;
    loading: boolean;
    onSubmit: (data: Omit<Factura, 'id' | 'usuario_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => void;
    onCancel: () => void;
}
export declare const FacturaForm: ({ factura, loading, onSubmit, onCancel }: FacturaFormProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FacturaForm.d.ts.map