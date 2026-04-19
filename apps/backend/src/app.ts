import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import authRoutes from './routes/auth';
import facturasRoutes from './routes/facturas';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'fiscord-backend',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/facturas', facturasRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`, err.stack);
  res.status(500).json({
    error: config.isDev ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

export default app;
