import { useState, useEffect } from 'react';
import type { Factura } from '../types';

interface FacturaFormProps {
  factura?: Factura;
  loading: boolean;
  onSubmit: (data: Omit<Factura, 'id' | 'usuario_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => void;
  onCancel: () => void;
}

export const FacturaForm = ({ factura, loading, onSubmit, onCancel }: FacturaFormProps) => {
  const [formData, setFormData] = useState({
    ncf: '',
    rnc_proveedor: '',
    tipo_factura: '',
    monto: '',
    itbis: '',
    isr: '',
    fecha_factura: '',
    fecha_vencimiento: '',
    descripcion: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (factura) {
      setFormData({
        ncf: factura.ncf,
        rnc_proveedor: factura.rnc_proveedor,
        tipo_factura: factura.tipo_factura,
        monto: String(factura.monto),
        itbis: String(factura.itbis || ''),
        isr: String(factura.isr || ''),
        fecha_factura: factura.fecha_factura.split('T')[0],
        fecha_vencimiento: factura.fecha_vencimiento?.split('T')[0] || '',
        descripcion: factura.descripcion || '',
      });
    }
  }, [factura]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ncf.match(/^\d{19}$/)) newErrors.ncf = 'NCF debe ser 19 dígitos';
    if (!formData.rnc_proveedor.match(/^\d{9}$/)) newErrors.rnc_proveedor = 'RNC debe ser 9 dígitos';
    if (!formData.tipo_factura) newErrors.tipo_factura = 'Tipo de factura requerido';
    if (!formData.monto || parseFloat(formData.monto) <= 0)
      newErrors.monto = 'Monto debe ser positivo';
    if (!formData.fecha_factura) newErrors.fecha_factura = 'Fecha de factura requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ncf: formData.ncf,
        rnc_proveedor: formData.rnc_proveedor,
        tipo_factura: formData.tipo_factura,
        monto: parseFloat(formData.monto),
        itbis: formData.itbis ? parseFloat(formData.itbis) : undefined,
        isr: formData.isr ? parseFloat(formData.isr) : undefined,
        fecha_factura: formData.fecha_factura,
        fecha_vencimiento: formData.fecha_vencimiento || undefined,
        descripcion: formData.descripcion || undefined,
        estado: 'activa',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            NCF <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ncf"
            value={formData.ncf}
            onChange={handleChange}
            placeholder="0000000000000000001"
            className={`w-full px-3 py-2 border rounded-md font-mono text-sm ${
              errors.ncf ? 'border-red-500 bg-red-50' : 'border-slate-300'
            }`}
            maxLength={19}
          />
          {errors.ncf && <p className="text-red-600 text-xs mt-1">{errors.ncf}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            RNC Proveedor <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="rnc_proveedor"
            value={formData.rnc_proveedor}
            onChange={handleChange}
            placeholder="123456789"
            className={`w-full px-3 py-2 border rounded-md font-mono text-sm ${
              errors.rnc_proveedor ? 'border-red-500 bg-red-50' : 'border-slate-300'
            }`}
            maxLength={9}
          />
          {errors.rnc_proveedor && (
            <p className="text-red-600 text-xs mt-1">{errors.rnc_proveedor}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tipo Factura <span className="text-red-500">*</span>
          </label>
          <select
            name="tipo_factura"
            value={formData.tipo_factura}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              errors.tipo_factura ? 'border-red-500 bg-red-50' : 'border-slate-300'
            }`}
          >
            <option value="">Seleccionar tipo</option>
            <option value="E31">E31</option>
            <option value="E32">E32</option>
            <option value="B01">B01</option>
            <option value="B02">B02</option>
          </select>
          {errors.tipo_factura && (
            <p className="text-red-600 text-xs mt-1">{errors.tipo_factura}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Monto <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              errors.monto ? 'border-red-500 bg-red-50' : 'border-slate-300'
            }`}
          />
          {errors.monto && <p className="text-red-600 text-xs mt-1">{errors.monto}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ITBIS</label>
          <input
            type="number"
            name="itbis"
            value={formData.itbis}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ISR</label>
          <input
            type="number"
            name="isr"
            value={formData.isr}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha Factura <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="fecha_factura"
            value={formData.fecha_factura}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              errors.fecha_factura ? 'border-red-500 bg-red-50' : 'border-slate-300'
            }`}
          />
          {errors.fecha_factura && (
            <p className="text-red-600 text-xs mt-1">{errors.fecha_factura}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha Vencimiento
          </label>
          <input
            type="date"
            name="fecha_vencimiento"
            value={formData.fecha_vencimiento}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
        />
      </div>

      <div className="flex gap-3 justify-end pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
