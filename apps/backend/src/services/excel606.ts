import ExcelJS from 'exceljs';
import { db } from '../database/db';

interface Fila606 {
  rnc_comprador: string;
  periodo: string; // AAAAMM
  tipo_id_proveedor: number; // 1=RNC, 2=Cedula
  rnc_proveedor: string;
  nombre_proveedor: string;
  ncf: string;
  ncf_modificado: string;
  tipo_bienes: string; // 01-15 DGII
  tipo_pago: string; // 01-05
  fecha_comprobante: string; // DD/MM/YYYY
  fecha_pago: string;
  monto_facturado: number;
  monto_facturado_mod: number;
  itbis_facturado: number;
  itbis_facturado_mod: number;
  itbis_retenido: number;
  itbis_proporcionalidad: number;
  itbis_costo: number;
  itbis_sujeto: number;
  itbis_percibido: number;
  tipo_retencion_isr: string;
  monto_isr: number;
  impuesto_selectivo: number;
  otros_impuestos: number;
  propina: number;
  forma_pago: string; // 01-05
  numero_cheque: string;
}

interface FacturaRow {
  id: string;
  ncf: string;
  rnc_proveedor: string;
  tipo_factura: string;
  monto: string;
  itbis: string;
  isr: string;
  fecha_factura: string;
  nombre_proveedor: string;
}

interface UsuarioRow {
  rnc: string;
}

export interface Generate606Options {
  mes: number;
  anio: number;
  estado?: string;
  tipo_factura?: string;
}

// DGII tipo_bienes mapping from tipo_factura
const TIPO_BIENES: Record<string, string> = {
  B01: '01',
  B02: '02',
  B14: '04',
  B15: '05',
  E31: '06',
  E32: '06',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export async function generateFacturas606Report(
  usuarioId: string,
  opts: Generate606Options,
): Promise<{ buffer: Buffer; filename: string; filas: number }> {
  const { mes, anio } = opts;

  // Fetch usuario RNC
  const usuarios = await db.query<UsuarioRow>(
    'SELECT rnc FROM usuarios WHERE id = $1',
    [usuarioId],
  );
  const rncComprador = usuarios[0]?.rnc ?? '';

  // Fetch facturas with proveedor name via LEFT JOIN
  const params: (string | number)[] = [usuarioId];
  const conditions = [
    'f.usuario_id = $1',
    'f.deleted_at IS NULL',
    `EXTRACT(MONTH FROM f.fecha_factura) = $${params.push(mes)}`,
    `EXTRACT(YEAR  FROM f.fecha_factura) = $${params.push(anio)}`,
  ];

  if (opts.estado) conditions.push(`f.estado = $${params.push(opts.estado)}`);
  if (opts.tipo_factura) conditions.push(`f.tipo_factura = $${params.push(opts.tipo_factura)}`);

  const facturas = await db.query<FacturaRow>(
    `SELECT f.id, f.ncf, f.rnc_proveedor, f.tipo_factura,
            f.monto, f.itbis, f.isr, f.fecha_factura,
            COALESCE(p.nombre, '') AS nombre_proveedor
       FROM facturas f
       LEFT JOIN proveedores p ON p.rnc = f.rnc_proveedor
      WHERE ${conditions.join(' AND ')}
      ORDER BY f.fecha_factura ASC`,
    params,
  );

  if (facturas.length === 0) {
    throw Object.assign(new Error('Sin facturas para el período'), { code: 'EMPTY' });
  }

  const periodo = `${anio}${String(mes).padStart(2, '0')}`;

  // Build data rows
  const filas: Fila606[] = facturas.map((f) => ({
    rnc_comprador: rncComprador,
    periodo,
    tipo_id_proveedor: f.rnc_proveedor.length === 9 ? 1 : 2,
    rnc_proveedor: f.rnc_proveedor,
    nombre_proveedor: f.nombre_proveedor,
    ncf: f.ncf,
    ncf_modificado: '',
    tipo_bienes: TIPO_BIENES[f.tipo_factura] ?? '06',
    tipo_pago: '01',
    fecha_comprobante: formatDate(f.fecha_factura),
    fecha_pago: formatDate(f.fecha_factura),
    monto_facturado: parseFloat(f.monto),
    monto_facturado_mod: 0,
    itbis_facturado: parseFloat(f.itbis ?? '0'),
    itbis_facturado_mod: 0,
    itbis_retenido: 0,
    itbis_proporcionalidad: 0,
    itbis_costo: 0,
    itbis_sujeto: 0,
    itbis_percibido: 0,
    tipo_retencion_isr: '',
    monto_isr: parseFloat(f.isr ?? '0'),
    impuesto_selectivo: 0,
    otros_impuestos: 0,
    propina: 0,
    forma_pago: '01',
    numero_cheque: '',
  }));

  // Build Excel workbook
  const wb = new ExcelJS.Workbook();
  wb.creator = 'FISCORD';
  wb.created = new Date();

  const ws = wb.addWorksheet('606', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // ── Column definitions ───────────────────────────────────────
  ws.columns = [
    { header: 'RNC Comprador',           key: 'rnc_comprador',         width: 14 },
    { header: 'Período',                 key: 'periodo',                width: 10 },
    { header: 'Tipo ID Proveedor',       key: 'tipo_id_proveedor',     width: 16 },
    { header: 'RNC/Cédula Proveedor',    key: 'rnc_proveedor',         width: 16 },
    { header: 'Nombre Proveedor',        key: 'nombre_proveedor',       width: 30 },
    { header: 'Número Comprobante',      key: 'ncf',                    width: 22 },
    { header: 'NCF Modificado',          key: 'ncf_modificado',         width: 22 },
    { header: 'Tipo Bienes/Servicios',   key: 'tipo_bienes',            width: 18 },
    { header: 'Tipo de Pago',            key: 'tipo_pago',              width: 12 },
    { header: 'Fecha Comprobante',       key: 'fecha_comprobante',      width: 16 },
    { header: 'Fecha de Pago',           key: 'fecha_pago',             width: 14 },
    { header: 'Monto Facturado',         key: 'monto_facturado',        width: 15, style: { numFmt: '#,##0.00' } },
    { header: 'Monto Facturado Mod.',    key: 'monto_facturado_mod',    width: 18, style: { numFmt: '#,##0.00' } },
    { header: 'ITBIS Facturado',         key: 'itbis_facturado',        width: 14, style: { numFmt: '#,##0.00' } },
    { header: 'ITBIS Facturado Mod.',    key: 'itbis_facturado_mod',    width: 18, style: { numFmt: '#,##0.00' } },
    { header: 'ITBIS Retenido',          key: 'itbis_retenido',         width: 14, style: { numFmt: '#,##0.00' } },
    { header: 'ITBIS Proporcionalidad',  key: 'itbis_proporcionalidad', width: 20, style: { numFmt: '#,##0.00' } },
    { header: 'ITBIS al Costo',          key: 'itbis_costo',            width: 13, style: { numFmt: '#,##0.00' } },
    { header: 'Bienes Sujetos ITBIS',    key: 'itbis_sujeto',           width: 18, style: { numFmt: '#,##0.00' } },
    { header: 'ITBIS Percibido',         key: 'itbis_percibido',        width: 14, style: { numFmt: '#,##0.00' } },
    { header: 'Tipo Retención ISR',      key: 'tipo_retencion_isr',     width: 18 },
    { header: 'Monto ISR Retenido',      key: 'monto_isr',              width: 16, style: { numFmt: '#,##0.00' } },
    { header: 'Impuesto Selectivo',      key: 'impuesto_selectivo',     width: 18, style: { numFmt: '#,##0.00' } },
    { header: 'Otros Impuestos',         key: 'otros_impuestos',        width: 14, style: { numFmt: '#,##0.00' } },
    { header: 'Propina Legal',           key: 'propina',                width: 13, style: { numFmt: '#,##0.00' } },
    { header: 'Forma de Pago',           key: 'forma_pago',             width: 13 },
    { header: 'Número Cheque/Transfer',  key: 'numero_cheque',          width: 22 },
  ];

  // ── Style header row ─────────────────────────────────────────
  const headerRow = ws.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
    };
  });

  // ── Add data rows ────────────────────────────────────────────
  filas.forEach((fila, idx) => {
    const row = ws.addRow(fila);
    row.height = 18;
    const isAlt = idx % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isAlt ? 'FFF0F4FA' : 'FFFFFFFF' },
      };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } },
      };
    });
  });

  // ── Totals row ───────────────────────────────────────────────
  const totalsRow = ws.addRow({
    rnc_comprador: 'TOTALES',
    periodo: '',
    tipo_id_proveedor: '',
    rnc_proveedor: '',
    nombre_proveedor: `${filas.length} facturas`,
    ncf: '',
    ncf_modificado: '',
    tipo_bienes: '',
    tipo_pago: '',
    fecha_comprobante: '',
    fecha_pago: '',
    monto_facturado: filas.reduce((s, f) => s + f.monto_facturado, 0),
    monto_facturado_mod: 0,
    itbis_facturado: filas.reduce((s, f) => s + f.itbis_facturado, 0),
    itbis_facturado_mod: 0,
    itbis_retenido: 0,
    itbis_proporcionalidad: 0,
    itbis_costo: 0,
    itbis_sujeto: 0,
    itbis_percibido: 0,
    tipo_retencion_isr: '',
    monto_isr: filas.reduce((s, f) => s + f.monto_isr, 0),
    impuesto_selectivo: 0,
    otros_impuestos: 0,
    propina: 0,
    forma_pago: '',
    numero_cheque: '',
  });

  totalsRow.height = 22;
  totalsRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } };
    cell.font = { bold: true, size: 10 };
    cell.alignment = { vertical: 'middle' };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF1F3864' } },
    };
  });

  // ── Generate buffer ──────────────────────────────────────────
  const buffer = Buffer.from(await wb.xlsx.writeBuffer());

  const mesStr = String(mes).padStart(2, '0');
  const filename = `DGII_606_${anio}${mesStr}.xlsx`;

  return { buffer, filename, filas: filas.length };
}
