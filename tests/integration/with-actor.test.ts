import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { createDb } from '#lib/server/db/client.ts';
import { profilesInApp } from '#lib/server/db/schema.ts';
import { withActor, type Executor } from '#lib/server/db/tx.ts';

// Runs against the local Supabase database (`pnpm db:start`).
const url = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const ADMIN_ID = '00000000-0000-4000-8000-00000000c0de';

const { db, close } = createDb(url);
afterAll(close);

class Rollback extends Error {}

/** Runs `fn` in a transaction that is always rolled back, so tests leave no rows behind. */
async function inRolledBackTx(fn: (tx: Executor) => Promise<void>) {
	await db
		.transaction(async (tx) => {
			await tx.execute(
				sql`insert into auth.users (id, email) values (${ADMIN_ID}, 'with-actor@matrifer.internal')`
			);
			await fn(tx);
			throw new Rollback();
		})
		.catch((error) => {
			if (!(error instanceof Rollback)) throw error;
		});
}

describe('withActor', () => {
	it('writes with the actor recorded in the audit log', async () => {
		await inRolledBackTx(async (tx) => {
			const inserted = await withActor(tx, ADMIN_ID, 'ADMIN', (trx) =>
				trx
					.insert(profilesInApp)
					.values({ id: ADMIN_ID, fullName: 'Admin', role: 'ADMIN' })
					.returning({ id: profilesInApp.id })
			);
			expect(inserted).toEqual([{ id: ADMIN_ID }]);

			const audit = await tx.execute(
				sql`select actor_id, actor_role, action, entity from app.audit_log where entity_id = ${ADMIN_ID}`
			);
			expect([...audit]).toEqual([
				{ actor_id: ADMIN_ID, actor_role: 'ADMIN', action: 'insert', entity: 'profiles' }
			]);
		});
	});

	it('rejects a write made outside withActor and stores nothing', async () => {
		await inRolledBackTx(async (tx) => {
			const write = tx.transaction((trx) =>
				trx.insert(profilesInApp).values({ id: ADMIN_ID, fullName: 'Admin', role: 'ADMIN' })
			);
			await expect(write).rejects.toMatchObject({
				cause: { message: expect.stringContaining('AUDIT_ACTOR_MISSING') }
			});

			const rows = await tx.execute(sql`select 1 from app.profiles where id = ${ADMIN_ID}`);
			expect(rows.length).toBe(0);
		});
	});

	it('rejects an actor id that is not a uuid before touching the database', async () => {
		await expect(withActor(db, 'not-a-uuid', 'ADMIN', async () => 'unreachable')).rejects.toThrow(
			'withActor: invalid actor'
		);
	});
});
