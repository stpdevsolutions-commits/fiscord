import { useState } from 'react';
import { reportesAPI } from '../services/api';

interface Reportes606ModalProps {
  onClose: () => void;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const TIPO_FACTURAS = ['', 'E31', 'E32', 'B01', 'B02', 'B14', 'B15'];

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const Reportes606Modal = ({ onClose }: Reportes606ModalProps) => {
  const now = new Date();

  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [tipoFactura, setTipoFactura] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ filename: string; filas: number } | null>(null);

  const anioMin = 2020;
  const anioMax = now.getFullYear();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await reportesAPI.generate606(mes, anio, {
        tipo_factura: tipoFactura || undefined,
      });

      triggerDownload(result.blob, result.filename);
      setSuccess({ filename: result.filename, filas: result.filas });
    } catch (err: any) {
      const msg =
        err?.response?.data instanceof Blob
          ? await err.response.data.text().then((t: string) => {
              try { return JSON.parse(t).message; } catch { return t; }
            })
          : err?.response?.data?.message ?? 'Error generando reporte';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-slate-900 text-white rounded-t-xl px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Reporte DGII 606</h2>
            <p className="text-xs text-slate-400 mt-0.5">Compras de Bienes y Servicios</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Período */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Período tributario</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Mes</label>
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {MESES.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Año</label>
                <input
                  type="number"
                  value={anio}
                  min={anioMin}
                  max={anioMax}
                  onChange={(e) => setAnio(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Filtros opcionales */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Filtros opcionales</p>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tipo de comprobante</label>
              <select
                value={tipoFactura}
                onChange={(e) => setTipoFactura(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Todos los tipos</option>
                {TIPO_FACTURAS.filter(Boolean).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
            <p className="font-medium">Formato DGII 606 — Formulario de Compras</p>
            <p>Incluye solo facturas en estado <strong>activa</strong> del período seleccionado.</p>
            <p>El archivo generado es compatible con el software SIPE de la DGII.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-start gap-2">
              <span className="text-lg leading-none">✅</span>
              <div>
                <p className="font-medium">Descarga iniciada</p>
                <p className="text-xs mt-0.5">
                  {success.filas} factura{success.filas !== 1 ? 's' : ''} exportada{success.filas !== 1 ? 's' : ''}
                  {' · '}<span className="font-mono">{success.filename}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            Cerrar
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || anio < anioMin || anio > anioMax}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Generando...
              </>
            ) : (
              <>⬇ Descargar Excel</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
