import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config';

const isRemote =
  !config.databaseUrl.includes('localhost') &&
  !config.databaseUrl.includes('127.0.0.1');

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: isRemote ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err: Error) => {
  console.error('[db] unexpected pool error:', err.message);
});

export async function connectDb(): Promise<void> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(sql, params);
}

export const db = {
  query: async <T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]> => {
    const result = await pool.query<T>(sql, params);
    return result.rows;
  },
};

export default pool;
