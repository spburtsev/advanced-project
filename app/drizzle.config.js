import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

if (existsSync('.env')) process.loadEnvFile();

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/lib/server/db/schema.js',
	out: './src/lib/server/db/migrations',
	dbCredentials: { url: /** @type {string} */ (process.env.DATABASE_URL) }
});
