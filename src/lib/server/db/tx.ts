import { sql } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { z } from 'zod';
import type { Schema } from './client';
import { appRoleInApp } from './schema';

/** A database client or an open transaction. */
export type Executor = PgDatabase<PostgresJsQueryResultHKT, Schema>;

export type AppRole = (typeof appRoleInApp.enumValues)[number];

const actorSchema = z.object({
	userId: z.uuid(),
	role: z.enum(appRoleInApp.enumValues)
});

/**
 * Runs `fn` in a transaction that carries the acting user.
 *
 * Every write must go through here: the audit triggers read the transaction-local settings
 * `app.user_id` and `app.user_role` and reject the write when they are missing. The settings are
 * local to the transaction, so this is safe behind a transaction pooler.
 */
export async function withActor<T>(
	db: Executor,
	userId: string,
	role: AppRole,
	fn: (tx: Executor) => Promise<T>
): Promise<T> {
	const actor = actorSchema.safeParse({ userId, role });
	if (!actor.success) {
		throw new Error('withActor: invalid actor');
	}

	return db.transaction(async (tx) => {
		await tx.execute(
			sql`select set_config('app.user_id', ${actor.data.userId}, true),
			           set_config('app.user_role', ${actor.data.role}, true)`
		);
		return fn(tx);
	});
}
