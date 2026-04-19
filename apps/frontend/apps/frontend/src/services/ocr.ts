import Tesseract from 'tesseract.js';

export interface OcrResult {
  ncf?: string;
  rnc?: string;
  monto?: number;
  fecha?: string;
  rawText?: string;
}

export interface OcrProgress {
  status: string;
  progress: number;
}

// NCF dominicano: letra(E|B) + 2 dígitos + hasta 17 dígitos — total 19 o 20 chars
const NCF_RE = /\b([EB]\d{2}\d{8,17})\b/i;
// RNC: exactamente 9 dígitos
const RNC_RE = /\b(\d{9})\b/;
// Monto: número con punto o coma decimal y al menos 2 decimales
const MONTO_RE = /\b(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\b/;
// Fecha: varias variantes → normalizar a YYYY-MM-DD
const FECHA_RE =
  /\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b/;

function parseMonto(raw: string): number {
  // Remove thousand separators, normalize decimal
  const clean = raw.replace(/[.,](?=\d{3})/g, '').replace(',', '.');
  return parseFloat(clean);
}

function parseFecha(raw: string): string {
  const parts = raw.split(/[-/]/);
  if (parts[0].length === 4) {
    // YYYY-MM-DD already
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }
  // DD-MM-YYYY → YYYY-MM-DD
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

export async function processFacturaOCR(
  imageFile: File,
  onProgress?: (p: OcrProgress) => void,
): Promise<OcrResult> {
  const { data } = await Tesseract.recognize(imageFile, 'spa+eng', {
    logger: (m) => {
      if (onProgress && m.status === 'recognizing text') {
        onProgress({ status: m.status, progress: Math.round(m.progress * 100) });
      }
    },
  });

  const text = data.text;
  const result: OcrResult = { rawText: text };

  const ncfMatch = text.match(NCF_RE);
  if (ncfMatch) {
    const raw = ncfMatch[1].toUpperCase();
    // Pad/trim to exactly 19 digits total
    result.ncf = raw.slice(0, 19).padEnd(19, '0');
  }

  const rncMatch = text.match(RNC_RE);
  if (rncMatch) result.rnc = rncMatch[1];

  // Find the largest monto candidate (usually the total)
  const montoMatches = [...text.matchAll(new RegExp(MONTO_RE.source, 'g'))];
  if (montoMatches.length > 0) {
    const montos = montoMatches.map((m) => parseMonto(m[1]));
    result.monto = Math.max(...montos);
  }

  const fechaMatch = text.match(FECHA_RE);
  if (fechaMatch) result.fecha = parseFecha(fechaMatch[1]);

  return result;
}
