import { useState, useEffect } from 'react';
import { useFacturas } from '../hooks/useFacturas';
import { Header } from '../components/Header';
import { FacturasTable } from '../components/FacturasTable';
import { FacturaForm } from '../components/FacturaForm';
import type { Factura } from '../types';

export const DashboardPage = () => {
  const { facturas, loading, error, pagination, getAll, create, update, delete: deleteFactura } = useFacturas();
  const [showForm, setShowForm] = useState(false);
  const [editingFactura, setEditingFactura] = useState<Factura | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    estado: '',
    tipo_factura: '',
    mes: '',
  });

  useEffect(() => {
    getAll(
      {
        estado: filters.estado || undefined,
        tipo_factura: filters.tipo_factura || undefined,
      },
      page,
      10,
    );
  }, [page, filters, getAll]);

  const handleCreateClick = () => {
    setEditingFactura(undefined);
    setShowForm(true);
  };

  const handleEditClick = (factura: Factura) => {
    setEditingFactura(factura);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Omit<Factura, 'id' | 'usuario_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    if (editingFactura) {
      const result = await update(editingFactura.id, data);
      if (result) {
        setShowForm(false);
        setEditingFactura(undefined);
      }
    } else {
      const result = await create(data);
      if (result) {
        setShowForm(false);
        setPage(1);
      }
    }
  };

  const handleDeleteClick = async (id: string) => {
    const success = await deleteFactura(id);
    if (success) {
      if (facturas.length === 1 && page > 1) {
        setPage(page - 1);
      }
    }
  };

  const totalMonto = facturas.reduce((sum, f) => sum + parseFloat(String(f.monto)), 0);
  const totalItbis = facturas.reduce((sum, f) => sum + parseFloat(String(f.itbis || 0)), 0);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('es-RD', { style: 'currency', currency: 'DOP' }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm">Total Facturas</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{pagination.total}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm">Monto Total</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{formatMoney(totalMonto)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm">ITBIS Total</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{formatMoney(totalItbis)}</p>
          </div>
        </div>

        {/* Filtros y Acciones */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
            <div className="flex gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => {
                    setFilters({ ...filters, estado: e.target.value });
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="">Todos</option>
                  <option value="activa">Activa</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo Factura
                </label>
                <select
                  value={filters.tipo_factura}
                  onChange={(e) => {
                    setFilters({ ...filters, tipo_factura: e.target.value });
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="">Todos</option>
                  <option value="E31">E31</option>
                  <option value="E32">E32</option>
                  <option value="B01">B01</option>
                  <option value="B02">B02</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateClick}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
              + Agregar Factura
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <FacturasTable
            facturas={facturas}
            loading={loading}
            onDelete={handleDeleteClick}
            onEdit={handleEditClick}
          />
        </div>

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 transition"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-slate-700">
              Página {page} de {pagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 transition"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingFactura ? 'Editar Factura' : 'Nueva Factura'}
              </h2>
            </div>

            <div className="p-6">
              <FacturaForm
                factura={editingFactura}
                loading={loading}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingFactura(undefined);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
