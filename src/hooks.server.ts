import type { Handle } from '@sveltejs/kit/hooks';
import { DATABASE_URL } from '$app/env/private';
import { createDb } from '#lib/server/db/client.ts';

export const handle: Handle = async ({ event, resolve }) => {
	// One client per request. It connects lazily, so routes that never query pay nothing.
	const { db, close } = createDb(DATABASE_URL);
	event.locals.db = db;

	try {
		return await resolve(event);
	} finally {
		const closing = close();
		// On Workers, let the response go out while the connection shuts down.
		if (event.platform?.ctx) event.platform.ctx.waitUntil(closing);
		else await closing;
	}
};
