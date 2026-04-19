import app from './app';
import { config } from './config';
import { connectDb } from './database/db';

async function start(): Promise<void> {
  await connectDb();
  console.log('[db] connected');

  const server = app.listen(config.port, () => {
    console.log(`[fiscord-backend] running on port ${config.port} (${config.nodeEnv})`);
  });

  process.on('SIGTERM', () => {
    console.log('[fiscord-backend] SIGTERM — shutting down gracefully');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('[fiscord-backend] SIGINT — shutting down gracefully');
    server.close(() => process.exit(0));
  });
}

start().catch((err: Error) => {
  console.error('[startup] failed:', err.message);
  process.exit(1);
});
