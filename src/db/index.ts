import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';
import fs from 'fs';
import path from 'path';

function resolveSqlHost(): string | undefined {
  const envHost = process.env.SQL_HOST;
  if (envHost && fs.existsSync(envHost)) {
    return envHost;
  }
  if (fs.existsSync('/app/cloudsql')) {
    try {
      const dirs = fs.readdirSync('/app/cloudsql');
      for (const dir of dirs) {
        const fullPath = path.join('/app/cloudsql', dir);
        if (fs.existsSync(path.join(fullPath, '.s.PGSQL.5432'))) {
          return fullPath;
        }
      }
      if (dirs.length > 0) {
        return path.join('/app/cloudsql', dirs[0]);
      }
    } catch {
      // ignore
    }
  }
  return envHost;
}

export const createPool = () => {
  const host = resolveSqlHost();
  return new Pool({
    host,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 1000,
    max: 5,
    keepAlive: true,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  // Gracefully log without crashing
  console.warn('SQL pool connection notice:', err?.message || err);
});

export const db = drizzle(pool, { schema });

