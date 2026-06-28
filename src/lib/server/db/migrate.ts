/**
 * Standalone migration runner (run via `bun run db:migrate`).
 * Reads DATABASE_URL from the environment (Bun auto-loads .env).
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url = process.env.DATABASE_URL ?? 'postgres://serivio:serivio@localhost:5432/serivio';

const client = postgres(url, { max: 1 });
const db = drizzle(client);

console.log('Running migrations…');
await migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations complete.');
await client.end();
