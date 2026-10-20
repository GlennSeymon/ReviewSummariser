import { existsSync } from 'node:fs';
import { defineConfig, env } from 'prisma/config';

// Load .env here so the CLI works under Node too (e.g. `bunx prisma`), not only under Bun.
const envFile = new URL('.env', import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: env('DATABASE_URL'),
	},
});
