import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Schema = typeof schema;
export type Db = PostgresJsDatabase<Schema>;

/**
 * Creates a database client. Call it once per request (see hooks.server.ts): Workers forbid
 * connections in the global scope, and module state is shared between requests.
 */
export function createDb(url: string): { db: Db; close: () => Promise<void> } {
	const client = postgres(url, {
		// Required by Supabase's transaction pooler (port 6543); harmless on a direct connection.
		prepare: false,
		max: 5
	});

	return {
		db: drizzle(client, { schema }),
		close: () => client.end({ timeout: 5 })
	};
}
