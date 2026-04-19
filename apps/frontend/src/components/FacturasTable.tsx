import { useNavigate } from 'react-router-dom';
import type { Factura } from '../types';

interface FacturasTableProps {
  facturas: Factura[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit: (factura: Factura) => void;
}

export const FacturasTable = ({ facturas, loading, onDelete, onEdit }: FacturasTableProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (facturas.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg">No hay facturas registradas</p>
        <p className="text-sm">Crea tu primera factura para comenzar</p>
      </div>
    );
  }

  const formatMoney = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-RD', { style: 'currency', currency: 'DOP' }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-RD');
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-slate-900">NCF</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900">Proveedor (RNC)</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900">Tipo</th>
            <th className="px-6 py-3 text-right font-semibold text-slate-900">Monto</th>
            <th className="px-6 py-3 text-right font-semibold text-slate-900">ITBIS</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900">Fecha</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900">Estado</th>
            <th className="px-6 py-3 text-center font-semibold text-slate-900">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((factura) => (
            <tr
              key={factura.id}
              className="border-b border-slate-200 hover:bg-slate-50 transition"
            >
              <td className="px-6 py-3 font-mono text-xs text-slate-700">{factura.ncf}</td>
              <td className="px-6 py-3 text-slate-700">{factura.rnc_proveedor}</td>
              <td className="px-6 py-3 text-slate-700">{factura.tipo_factura}</td>
              <td className="px-6 py-3 text-right font-medium text-slate-900">
                {formatMoney(factura.monto)}
              </td>
              <td className="px-6 py-3 text-right text-slate-700">
                {formatMoney(factura.itbis || 0)}
              </td>
              <td className="px-6 py-3 text-slate-700">
                {formatDate(factura.fecha_factura)}
              </td>
              <td className="px-6 py-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    factura.estado === 'activa'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {factura.estado}
                </span>
              </td>
              <td className="px-6 py-3 text-center">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => navigate(`/facturas/${factura.id}`)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => onEdit(factura)}
                    className="text-slate-600 hover:text-slate-800 font-medium text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
                        onDelete(factura.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 font-medium text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
