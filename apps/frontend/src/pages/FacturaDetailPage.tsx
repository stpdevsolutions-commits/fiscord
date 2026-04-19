import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFacturas } from '../hooks/useFacturas';
import { Header } from '../components/Header';
import { FacturaForm } from '../components/FacturaForm';
import type { Factura } from '../types';

export const FacturaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, error, getById, update, delete: deleteFactura } = useFacturas();
  const [factura, setFactura] = useState<Factura | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const fetchFactura = async () => {
      if (id) {
        const result = await getById(id);
        setFactura(result);
      }
    };
    fetchFactura();
  }, [id, getById]);

  const handleDelete = async () => {
    if (id && confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
      const success = await deleteFactura(id);
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  const handleUpdate = async (data: Omit<Factura, 'id' | 'usuario_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    if (id) {
      const result = await update(id, data);
      if (result) {
        setFactura(result);
        setShowEditForm(false);
      }
    }
  };

  if (loading && !factura) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <p className="text-lg font-medium">Factura no encontrada</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatMoney = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-RD', { style: 'currency', currency: 'DOP' }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-RD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!showEditForm ? (
          <div className="bg-white rounded-lg shadow">
            {/* Encabezado */}
            <div className="border-b border-slate-200 px-6 py-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Factura {factura.ncf}</h1>
                  <p className="text-slate-600 mt-1">
                    {factura.estado === 'activa' ? (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Activa
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-medium">
                        {factura.estado}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="px-6 py-6 space-y-8">
              {/* Información General */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Información General</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-600">RNC Proveedor</p>
                    <p className="text-lg font-medium text-slate-900 mt-1">{factura.rnc_proveedor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Tipo Factura</p>
                    <p className="text-lg font-medium text-slate-900 mt-1">{factura.tipo_factura}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Fecha Factura</p>
                    <p className="text-lg font-medium text-slate-900 mt-1">
                      {formatDate(factura.fecha_factura)}
                    </p>
                  </div>
                  {factura.fecha_vencimiento && (
                    <div>
                      <p className="text-sm text-slate-600">Fecha Vencimiento</p>
                      <p className="text-lg font-medium text-slate-900 mt-1">
                        {formatDate(factura.fecha_vencimiento)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Montos */}
              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Montos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">Monto</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{formatMoney(factura.monto)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">ITBIS</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">{formatMoney(factura.itbis || 0)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">ISR</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">{formatMoney(factura.isr || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {factura.descripcion && (
                <div className="border-t border-slate-200 pt-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Descripción</h2>
                  <p className="text-slate-700 whitespace-pre-wrap">{factura.descripcion}</p>
                </div>
              )}

              {/* Metadatos */}
              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Información del Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-slate-600">Creada</p>
                    <p className="text-slate-900 font-mono text-xs mt-1">{formatDate(factura.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Última actualización</p>
                    <p className="text-slate-900 font-mono text-xs mt-1">{formatDate(factura.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-slate-700 hover:text-slate-900 transition"
              >
                ← Volver al Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Editar Factura</h2>
            <FacturaForm
              factura={factura}
              loading={loading}
              onSubmit={handleUpdate}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
