import { Router, Request, Response } from 'express';
import { createFacturaSchema } from '../schemas/facturas';
import { authMiddleware } from '../middleware/auth';
import { db } from '../database/db';
import type { Factura } from '../types';

const router = Router();

router.use(authMiddleware);

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const validation = createFacturaSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      error: 'ValidationError',
      message: validation.error.issues[0].message,
      details: validation.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  const {
    ncf,
    rnc_proveedor,
    tipo_factura,
    monto,
    itbis = 0,
    isr = 0,
    fecha_factura,
    fecha_vencimiento,
    descripcion,
    foto_url,
  } = validation.data;

  try {
    const proveedor = await db.query<{ id: string }>(
      'SELECT id FROM proveedores WHERE rnc = $1',
      [rnc_proveedor],
    );
    if (proveedor.length === 0) {
      res.status(404).json({
        error: 'NotFoundError',
        message: `Proveedor con RNC ${rnc_proveedor} no encontrado`,
      });
      return;
    }

    const duplicate = await db.query<{ id: string }>(
      'SELECT id FROM facturas WHERE ncf = $1 AND deleted_at IS NULL',
      [ncf],
    );
    if (duplicate.length > 0) {
      res.status(409).json({
        error: 'ConflictError',
        message: `El NCF ${ncf} ya está registrado`,
      });
      return;
    }

    const rows = await db.query<Factura>(
      `INSERT INTO facturas (
        usuario_id, ncf, rnc_proveedor, tipo_factura,
        monto, itbis, isr,
        fecha_factura, fecha_vencimiento,
        descripcion, foto_url, estado
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'activa')
      RETURNING *`,
      [
        req.user!.userId,
        ncf,
        rnc_proveedor,
        tipo_factura,
        monto,
        itbis,
        isr,
        fecha_factura,
        fecha_vencimiento ?? null,
        descripcion ?? null,
        foto_url ?? null,
      ],
    );

    res.status(201).json({ factura: rows[0] });
  } catch (err) {
    console.error('[facturas] POST error:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Error en el servidor' });
  }
});

// GET /api/facturas, GET /:id, PUT /:id, DELETE /:id — Sprint 2 continuación

export default router;
