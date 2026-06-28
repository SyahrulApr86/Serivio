import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
	// Fallback for tooling runs; real value comes from .env
	process.env.DATABASE_URL = 'postgres://serivio:serivio@localhost:5432/serivio';
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL
	},
	verbose: true,
	strict: true
});
