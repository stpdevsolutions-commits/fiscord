import Tesseract from 'tesseract.js';

export interface OcrResult {
  ncf?: string;
  rnc?: string;
  monto?: number;
  fecha?: string;
}

const NCF_RE = /[EB]\d{18}/g;
const RNC_RE = /\b\d{9}\b/g;
const MONTO_RE = /\b\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{2})?\b/g;
const FECHA_RE = /(\d{4}-\d{2}-\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/g;

export async function extractOcrFields(imageBuffer: Buffer): Promise<OcrResult> {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, 'spa+eng', {
    logger: () => {},
  });

  const ncfMatch = text.match(NCF_RE);
  const rncMatches = text.match(RNC_RE);
  const montoMatches = text.match(MONTO_RE);
  const fechaMatches = text.match(FECHA_RE);

  let monto: number | undefined;
  if (montoMatches) {
    const parsed = montoMatches
      .map((m) => parseFloat(m.replace(/[,\s]/g, '').replace(',', '.')))
      .filter((n) => !isNaN(n) && n > 0);
    if (parsed.length > 0) monto = Math.max(...parsed);
  }

  let fecha: string | undefined;
  if (fechaMatches) {
    const raw = fechaMatches[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      fecha = raw;
    } else {
      const parts = raw.split(/[-/]/);
      if (parts.length === 3) fecha = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  return {
    ncf: ncfMatch?.[0],
    rnc: rncMatches?.[0],
    monto,
    fecha,
  };
}
