// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Db } from '#lib/server/db/client.ts';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Per-request database client. Writes must go through `withActor`. */
			db: Db;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}
	}
}

export {};
