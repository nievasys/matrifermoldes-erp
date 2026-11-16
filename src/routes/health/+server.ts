import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * Liveness probe for the uptime monitor (docs/stack.md §16). Public on purpose: it exposes no data
 * and keeps the free-tier database from pausing.
 */
export const GET: RequestHandler = async ({ locals }) => {
	const headers = { 'cache-control': 'no-store' };

	try {
		await locals.db.execute(sql`select 1`);
		return json({ status: 'ok' }, { headers });
	} catch {
		return json({ status: 'unavailable' }, { status: 503, headers });
	}
};
