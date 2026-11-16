import { defineConfig } from 'drizzle-kit';

// Introspection only. SQL migrations in supabase/migrations are the single source of truth;
// `pnpm db:pull` regenerates src/lib/server/db/schema.ts from the database.
export default defineConfig({
	dialect: 'postgresql',
	out: './.drizzle',
	schemaFilter: ['app'],
	dbCredentials: {
		url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
	}
});
