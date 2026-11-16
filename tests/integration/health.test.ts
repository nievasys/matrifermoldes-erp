import { afterAll, describe, expect, it } from 'vitest';
import { createDb } from '#lib/server/db/client.ts';
import { GET } from '../../src/routes/health/+server';

const url = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

type HealthEvent = Parameters<typeof GET>[0];
const eventWith = (db: unknown) => ({ locals: { db } }) as unknown as HealthEvent;

describe('GET /health', () => {
	const live = createDb(url);
	afterAll(live.close);

	it('answers 200 when the database responds', async () => {
		const response = await GET(eventWith(live.db));

		expect(response.status).toBe(200);
		expect(response.headers.get('cache-control')).toBe('no-store');
		expect(await response.json()).toEqual({ status: 'ok' });
	});

	it('answers 503 without leaking details when the database is unreachable', async () => {
		const dead = createDb('postgresql://postgres:postgres@127.0.0.1:1/postgres');

		const response = await GET(eventWith(dead.db));
		await dead.close();

		expect(response.status).toBe(503);
		expect(await response.json()).toEqual({ status: 'unavailable' });
	});
});
