import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { extractOcrFields } from '../services/ocr';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.post('/', authMiddleware, upload.single('image') as any, async (req: any, res: any) => {
  if (!req.file) {
    res.status(400).json({ error: 'Imagen requerida', code: 'MISSING_IMAGE' });
    return;
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (!allowed.includes(req.file.mimetype)) {
    res.status(400).json({ error: 'Tipo de archivo no soportado', code: 'INVALID_FILE_TYPE' });
    return;
  }

  try {
    const result = await extractOcrFields(req.file.buffer);
    res.json(result);
  } catch (err) {
    console.error('[OCR] Error procesando imagen:', err);
    res.status(500).json({ error: 'Error procesando imagen', code: 'OCR_ERROR' });
  }
});

export default router;
