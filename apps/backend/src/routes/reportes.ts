import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { generateFacturas606Report } from '../services/excel606';

const router = Router();

router.use(authMiddleware);

router.post('/606/generate', async (req: Request, res: Response): Promise<void> => {
  const { mes, anio, estado, tipo_factura } = req.body;
  const userId = req.user!.userId;

  // ── Validation ───────────────────────────────────────────────
  const mesNum = Number(mes);
  const anioNum = Number(anio);

  if (!mes || !anio || isNaN(mesNum) || isNaN(anioNum)) {
    res.status(400).json({ error: 'ValidationError', message: 'mes y año son requeridos' });
    return;
  }
  if (mesNum < 1 || mesNum > 12) {
    res.status(400).json({ error: 'ValidationError', message: 'mes debe estar entre 1 y 12' });
    return;
  }
  if (anioNum < 2020 || anioNum > new Date().getFullYear() + 1) {
    res.status(400).json({ error: 'ValidationError', message: 'año inválido (mínimo 2020)' });
    return;
  }

  try {
    const { buffer, filename, filas } = await generateFacturas606Report(userId, {
      mes: mesNum,
      anio: anioNum,
      estado: estado || 'activa',
      tipo_factura: tipo_factura || undefined,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-606-Filas', String(filas));
    res.send(buffer);
  } catch (err: any) {
    if (err?.code === 'EMPTY') {
      res.status(404).json({
        error: 'NotFoundError',
        message: `Sin facturas activas para ${String(mes).padStart(2, '0')}/${anio}`,
      });
      return;
    }
    console.error('[reportes] 606 error:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Error generando reporte' });
  }
});

export default router;
