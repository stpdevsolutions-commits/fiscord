import { useState, useEffect, useRef } from 'react';
import type { Factura } from '../types';
import { useAuth } from '../hooks/useAuth';
import { uploadFacturaPhoto } from '../services/supabase';
import { processFacturaOCR, type OcrResult } from '../services/ocr';

type FacturaPayload = Omit<Factura, 'id' | 'usuario_id' | 'created_at' | 'updated_at' | 'deleted_at'>;

interface FacturaFormProps {
  factura?: Factura;
  loading: boolean;
  onSubmit: (data: FacturaPayload) => void;
  onCancel: () => void;
}

interface OcrState {
  running: boolean;
  progress: number;
  status: string;
  detected: OcrResult | null;
}

const TIPO_FACTURAS = ['E31', 'E32', 'B01', 'B02', 'B14', 'B15'];
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 5;

export const FacturaForm = ({ factura, loading, onSubmit, onCancel }: FacturaFormProps) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
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
  const [autoFilled, setAutoFilled] = useState<Set<string>>(new Set());

  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OCR state
  const [ocr, setOcr] = useState<OcrState>({
    running: false,
    progress: 0,
    status: '',
    detected: null,
  });

  useEffect(() => {
    if (factura) {
      setForm({
        ncf: factura.ncf,
        rnc_proveedor: factura.rnc_proveedor,
        tipo_factura: factura.tipo_factura,
        monto: String(factura.monto),
        itbis: String(factura.itbis ?? ''),
        isr: String(factura.isr ?? ''),
        fecha_factura: factura.fecha_factura.split('T')[0],
        fecha_vencimiento: factura.fecha_vencimiento?.split('T')[0] ?? '',
        descripcion: factura.descripcion ?? '',
      });
      if (factura.foto_url) {
        setPhotoPreview(factura.foto_url);
      }
    }
  }, [factura]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setAutoFilled((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // --- Photo handling ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError('Solo se permiten JPG, PNG, WebP o PDF');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setPhotoError(`El archivo no puede superar ${MAX_SIZE_MB} MB`);
      return;
    }

    setPhotoFile(file);
    setOcr({ running: false, progress: 0, status: '', detected: null });

    if (file.type !== 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError(null);
    setOcr({ running: false, progress: 0, status: '', detected: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- OCR ---
  const handleOcrScan = async () => {
    if (!photoFile || photoFile.type === 'application/pdf') return;

    setOcr({ running: true, progress: 0, status: 'Iniciando...', detected: null });

    try {
      const result = await processFacturaOCR(photoFile, ({ status, progress }) => {
        setOcr((prev) => ({ ...prev, status, progress }));
      });

      const newAutoFilled = new Set<string>();
      const updates: Partial<typeof form> = {};

      if (result.ncf && !form.ncf) {
        updates.ncf = result.ncf;
        newAutoFilled.add('ncf');
      }
      if (result.rnc && !form.rnc_proveedor) {
        updates.rnc_proveedor = result.rnc;
        newAutoFilled.add('rnc_proveedor');
      }
      if (result.monto && !form.monto) {
        updates.monto = String(result.monto);
        newAutoFilled.add('monto');
      }
      if (result.fecha && !form.fecha_factura) {
        updates.fecha_factura = result.fecha;
        newAutoFilled.add('fecha_factura');
      }

      setForm((prev) => ({ ...prev, ...updates }));
      setAutoFilled((prev) => new Set([...prev, ...newAutoFilled]));
      setOcr({ running: false, progress: 100, status: 'Completado', detected: result });
    } catch {
      setOcr({ running: false, progress: 0, status: 'Error en OCR', detected: null });
    }
  };

  // --- Validation ---
  const validate = () => {
    const errs: Record<string, string> = {};

    if (!/^\d{19}$/.test(form.ncf)) errs.ncf = 'NCF debe ser 19 dígitos';
    if (!/^\d{9}$/.test(form.rnc_proveedor)) errs.rnc_proveedor = 'RNC debe ser 9 dígitos';
    if (!form.tipo_factura) errs.tipo_factura = 'Requerido';
    if (!form.monto || parseFloat(form.monto) <= 0) errs.monto = 'Monto debe ser positivo';
    if (!form.fecha_factura) errs.fecha_factura = 'Requerido';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let fotoUrl: string | undefined = factura?.foto_url;

    if (photoFile && user) {
      setUploading(true);
      try {
        const tempId = crypto.randomUUID();
        const { url } = await uploadFacturaPhoto(photoFile, user.id, tempId);
        fotoUrl = url;
      } catch (err) {
        setPhotoError('Error subiendo imagen. Revisa la conexión e intenta de nuevo.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSubmit({
      ncf: form.ncf,
      rnc_proveedor: form.rnc_proveedor,
      tipo_factura: form.tipo_factura,
      monto: parseFloat(form.monto),
      itbis: form.itbis ? parseFloat(form.itbis) : undefined,
      isr: form.isr ? parseFloat(form.isr) : undefined,
      fecha_factura: form.fecha_factura,
      fecha_vencimiento: form.fecha_vencimiento || undefined,
      descripcion: form.descripcion || undefined,
      foto_url: fotoUrl,
      estado: 'activa',
    });
  };

  const isBusy = loading || uploading || ocr.running;

  const fieldClass = (name: string) =>
    `w-full px-3 py-2 border rounded-md text-sm transition ${
      errors[name]
        ? 'border-red-400 bg-red-50'
        : autoFilled.has(name)
          ? 'border-blue-400 bg-blue-50'
          : 'border-slate-300'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ─── Foto + OCR ─────────────────────────────────── */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Foto de la factura</p>

        {photoPreview ? (
          <div className="relative inline-block">
            <img
              src={photoPreview}
              alt="Preview"
              className="max-h-48 rounded border border-slate-200 object-contain"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs hover:bg-red-700"
            >
              ✕
            </button>
          </div>
        ) : photoFile?.type === 'application/pdf' ? (
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <span>📄</span>
            <span>{photoFile.name}</span>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="ml-2 text-red-600 hover:text-red-800 text-xs"
            >
              Quitar
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            <span className="text-2xl">📷</span>
            <span className="text-sm text-slate-500 mt-1">
              Subir foto (JPG, PNG, PDF · máx 5 MB)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {photoError && <p className="text-red-600 text-xs">{photoError}</p>}

        {/* OCR Button */}
        {photoFile && photoFile.type !== 'application/pdf' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleOcrScan}
              disabled={ocr.running}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm rounded-md hover:bg-violet-700 disabled:opacity-50 transition"
            >
              {ocr.running ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  Escaneando... {ocr.progress}%
                </>
              ) : (
                <>🔍 Escanear OCR</>
              )}
            </button>

            {ocr.detected && (
              <p className="text-xs text-green-700 bg-green-50 px-3 py-1 rounded">
                ✓ OCR completado — campos resaltados en azul fueron detectados automáticamente
              </p>
            )}

            {ocr.status === 'Error en OCR' && (
              <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded">
                ⚠ OCR no pudo leer la imagen — ingresa los datos manualmente
              </p>
            )}
          </div>
        )}
      </div>

      {/* ─── Campos del formulario ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            NCF <span className="text-red-500">*</span>
            {autoFilled.has('ncf') && (
              <span className="ml-2 text-blue-600 text-xs">· detectado</span>
            )}
          </label>
          <input
            type="text"
            name="ncf"
            value={form.ncf}
            onChange={handleChange}
            placeholder="0000000000000000001"
            maxLength={19}
            className={`${fieldClass('ncf')} font-mono`}
          />
          {errors.ncf && <p className="text-red-600 text-xs mt-1">{errors.ncf}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            RNC Proveedor <span className="text-red-500">*</span>
            {autoFilled.has('rnc_proveedor') && (
              <span className="ml-2 text-blue-600 text-xs">· detectado</span>
            )}
          </label>
          <input
            type="text"
            name="rnc_proveedor"
            value={form.rnc_proveedor}
            onChange={handleChange}
            placeholder="123456789"
            maxLength={9}
            className={`${fieldClass('rnc_proveedor')} font-mono`}
          />
          {errors.rnc_proveedor && (
            <p className="text-red-600 text-xs mt-1">{errors.rnc_proveedor}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Tipo Factura <span className="text-red-500">*</span>
          </label>
          <select
            name="tipo_factura"
            value={form.tipo_factura}
            onChange={handleChange}
            className={fieldClass('tipo_factura')}
          >
            <option value="">Seleccionar tipo</option>
            {TIPO_FACTURAS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.tipo_factura && (
            <p className="text-red-600 text-xs mt-1">{errors.tipo_factura}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Monto <span className="text-red-500">*</span>
            {autoFilled.has('monto') && (
              <span className="ml-2 text-blue-600 text-xs">· detectado</span>
            )}
          </label>
          <input
            type="number"
            name="monto"
            value={form.monto}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={fieldClass('monto')}
          />
          {errors.monto && <p className="text-red-600 text-xs mt-1">{errors.monto}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">ITBIS</label>
          <input
            type="number"
            name="itbis"
            value={form.itbis}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={fieldClass('itbis')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">ISR</label>
          <input
            type="number"
            name="isr"
            value={form.isr}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={fieldClass('isr')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Fecha Factura <span className="text-red-500">*</span>
            {autoFilled.has('fecha_factura') && (
              <span className="ml-2 text-blue-600 text-xs">· detectado</span>
            )}
          </label>
          <input
            type="date"
            name="fecha_factura"
            value={form.fecha_factura}
            onChange={handleChange}
            className={fieldClass('fecha_factura')}
          />
          {errors.fecha_factura && (
            <p className="text-red-600 text-xs mt-1">{errors.fecha_factura}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Fecha Vencimiento
          </label>
          <input
            type="date"
            name="fecha_vencimiento"
            value={form.fecha_vencimiento}
            onChange={handleChange}
            className={fieldClass('fecha_vencimiento')}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isBusy}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 min-w-[120px]"
        >
          {uploading ? 'Subiendo...' : loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
