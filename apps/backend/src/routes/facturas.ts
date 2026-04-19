import { Router, Request, Response } from 'express';
import { createFacturaSchema, updateFacturaSchema } from '../schemas/facturas';
import { authMiddleware } from '../middleware/auth';
import { db } from '../database/db';
import type { Factura } from '../types';
import { validate as validateUUID } from 'uuid';

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

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!validateUUID(id)) {
      res.status(400).json({ error: 'ValidationError', message: 'ID debe ser un UUID válido' });
      return;
    }

    const factura = await db.query<Factura>(
      'SELECT * FROM facturas WHERE id = $1 AND usuario_id = $2 AND deleted_at IS NULL',
      [id, userId],
    );

    if (factura.length === 0) {
      res.status(404).json({ error: 'NotFoundError', message: 'Factura no encontrada' });
      return;
    }

    res.status(200).json({ factura: factura[0] });
  } catch (err) {
    console.error('[facturas] GET/:id error:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Error en el servidor' });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!validateUUID(id)) {
      res.status(400).json({ error: 'ValidationError', message: 'ID debe ser un UUID válido' });
      return;
    }

    const validation = updateFacturaSchema.safeParse(req.body);
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

    if (req.body.usuario_id) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'No se puede cambiar el usuario_id',
      });
      return;
    }

    const factura = await db.query<Factura>(
      'SELECT * FROM facturas WHERE id = $1 AND usuario_id = $2 AND deleted_at IS NULL',
      [id, userId],
    );

    if (factura.length === 0) {
      res.status(404).json({ error: 'NotFoundError', message: 'Factura no encontrada' });
      return;
    }

    const { ncf, rnc_proveedor, tipo_factura, monto, itbis, isr, fecha_factura, fecha_vencimiento, descripcion, foto_url } = validation.data;

    if (ncf && ncf !== factura[0].ncf) {
      const duplicate = await db.query<{ id: string }>(
        'SELECT id FROM facturas WHERE ncf = $1 AND id != $2 AND deleted_at IS NULL',
        [ncf, id],
      );
      if (duplicate.length > 0) {
        res.status(409).json({
          error: 'ConflictError',
          message: `El NCF ${ncf} ya está registrado`,
        });
        return;
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (ncf !== undefined) {
      updates.push(`ncf = $${paramIndex}`);
      values.push(ncf);
      paramIndex++;
    }
    if (rnc_proveedor !== undefined) {
      updates.push(`rnc_proveedor = $${paramIndex}`);
      values.push(rnc_proveedor);
      paramIndex++;
    }
    if (tipo_factura !== undefined) {
      updates.push(`tipo_factura = $${paramIndex}`);
      values.push(tipo_factura);
      paramIndex++;
    }
    if (monto !== undefined) {
      updates.push(`monto = $${paramIndex}`);
      values.push(monto);
      paramIndex++;
    }
    if (itbis !== undefined) {
      updates.push(`itbis = $${paramIndex}`);
      values.push(itbis);
      paramIndex++;
    }
    if (isr !== undefined) {
      updates.push(`isr = $${paramIndex}`);
      values.push(isr);
      paramIndex++;
    }
    if (fecha_factura !== undefined) {
      updates.push(`fecha_factura = $${paramIndex}`);
      values.push(fecha_factura);
      paramIndex++;
    }
    if (fecha_vencimiento !== undefined) {
      updates.push(`fecha_vencimiento = $${paramIndex}`);
      values.push(fecha_vencimiento ?? null);
      paramIndex++;
    }
    if (descripcion !== undefined) {
      updates.push(`descripcion = $${paramIndex}`);
      values.push(descripcion ?? null);
      paramIndex++;
    }
    if (foto_url !== undefined) {
      updates.push(`foto_url = $${paramIndex}`);
      values.push(foto_url ?? null);
      paramIndex++;
    }

    if (updates.length === 0) {
      res.status(200).json({ factura: factura[0] });
      return;
    }

    values.push(id);
    const updateQuery = `UPDATE facturas SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const updated = await db.query<Factura>(updateQuery, values);

    res.status(200).json({ factura: updated[0] });
  } catch (err) {
    console.error('[facturas] PUT/:id error:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Error en el servidor' });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!validateUUID(id)) {
      res.status(400).json({ error: 'ValidationError', message: 'ID debe ser un UUID válido' });
      return;
    }

    const factura = await db.query<Factura>(
      'SELECT * FROM facturas WHERE id = $1 AND usuario_id = $2 AND deleted_at IS NULL',
      [id, userId],
    );

    if (factura.length === 0) {
      res.status(404).json({ error: 'NotFoundError', message: 'Factura no encontrada' });
      return;
    }

    await db.query(
      'UPDATE facturas SET deleted_at = NOW() WHERE id = $1',
      [id],
    );

    res.status(200).json({ message: 'Factura eliminada' });
  } catch (err) {
    console.error('[facturas] DELETE/:id error:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Error en el servidor' });
  }
});

export default router;
