import { Router, Request, Response } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth';
import { hashPassword, verifyPassword, generateToken, TOKEN_EXPIRY } from '../utils/crypto';
import { authMiddleware } from '../middleware/auth';
import { db } from '../database/db';
import type { User } from '../types';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      error: 'ValidationError',
      message: validation.error.issues[0].message,
      details: validation.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  const { email, password, nombre, rnc, empresa } = validation.data;

  try {
    const existing = await db.query<{ id: string }>(
      'SELECT id FROM usuarios WHERE email = $1',
      [email],
    );
    if (existing.length > 0) {
      res.status(409).json({ error: 'ConflictError', message: 'El email ya está registrado' });
      return;
    }

    const passwordHash = await hashPassword(password);

    const rows = await db.query<User>(
      `INSERT INTO usuarios (email, password_hash, nombre, rnc, empresa)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, nombre, rnc, empresa, created_at`,
      [email, passwordHash, nombre, rnc ?? null, empresa ?? null],
    );

    const user = rows[0];
    const token = generateToken(user.id, user.email);

    res.status(201).json({ token, user, expiresIn: TOKEN_EXPIRY });
  } catch (err) {
    console.error('[auth] register error:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Error en el servidor' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      error: 'ValidationError',
      message: validation.error.issues[0].message,
    });
    return;
  }

  const { email, password } = validation.data;

  try {
    const rows = await db.query<User & { password_hash: string }>(
      `SELECT id, email, nombre, rnc, empresa, created_at, password_hash
       FROM usuarios
       WHERE email = $1 AND deleted_at IS NULL`,
      [email],
    );

    const isValid = rows.length > 0 && (await verifyPassword(password, rows[0].password_hash));

    if (!isValid) {
      res.status(401).json({
        error: 'AuthenticationError',
        message: 'Email o contraseña incorrectos',
      });
      return;
    }

    const { password_hash: _, ...user } = rows[0];
    const token = generateToken(user.id, user.email);

    res.status(200).json({ token, user, expiresIn: TOKEN_EXPIRY });
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Error en el servidor' });
  }
});

router.post('/logout', (_req: Request, res: Response): void => {
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.query<User>(
      `SELECT id, email, nombre, rnc, empresa, created_at
       FROM usuarios
       WHERE id = $1 AND deleted_at IS NULL`,
      [req.user!.userId],
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'NotFoundError', message: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error('[auth] me error:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Error en el servidor' });
  }
});

export default router;
