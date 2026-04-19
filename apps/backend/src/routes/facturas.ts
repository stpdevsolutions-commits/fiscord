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

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const pageStr = req.query.page as string | undefined;
    const limitStr = req.query.limit as string | undefined;

    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 50;

    if ((pageStr && (isNaN(page) || page < 1)) || (limitStr && (isNaN(limit) || limit < 1 || limit > 100))) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Parámetros inválidos: page >= 1, limit 1-100',
      });
      return;
    }

    const sortParam = (req.query.sort as string) || 'fecha_factura:desc';
    const [sortField, sortOrder] = sortParam.split(':');
    const validSortFields = ['fecha_factura', 'monto', 'creado'];
    const validSortOrders = ['asc', 'desc'];

    if (!validSortFields.includes(sortField) || !validSortOrders.includes(sortOrder)) {
      res.status(400).json({
        error: 'ValidationError',
        message: `Sort inválido. Campos: ${validSortFields.join(', ')}, Órdenes: asc, desc`,
      });
      return;
    }

    const sortColumnMap: { [key: string]: string } = {
      fecha_factura: 'fecha_factura',
      monto: 'monto',
      creado: 'created_at',
    };
    const sortColumn = sortColumnMap[sortField];

    const whereConditions: string[] = ['usuario_id = $1', 'deleted_at IS NULL'];
    const params: (string | null)[] = [userId];
    let paramIndex = 2;

    if (req.query.estado) {
      whereConditions.push(`estado = $${paramIndex}`);
      params.push(req.query.estado as string);
      paramIndex++;
    }

    if (req.query.tipo_factura) {
      whereConditions.push(`tipo_factura = $${paramIndex}`);
      params.push(req.query.tipo_factura as string);
      paramIndex++;
    }

    if (req.query.rnc_proveedor) {
      whereConditions.push(`rnc_proveedor = $${paramIndex}`);
      params.push(req.query.rnc_proveedor as string);
      paramIndex++;
    }

    if (req.query.fecha_desde) {
      whereConditions.push(`fecha_factura >= $${paramIndex}`);
      params.push(req.query.fecha_desde as string);
      paramIndex++;
    }

    if (req.query.fecha_hasta) {
      whereConditions.push(`fecha_factura <= $${paramIndex}`);
      params.push(req.query.fecha_hasta as string);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const countResult = await db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM facturas WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult[0].count.toString());

    const offset = (page - 1) * limit;
    const facturas = await db.query<Factura>(
      `SELECT * FROM facturas
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    const pages = Math.ceil(total / limit);

    res.status(200).json({
      facturas,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (err) {
    console.error('[facturas] GET error:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Error en el servidor' });
  }
});

export default router;
