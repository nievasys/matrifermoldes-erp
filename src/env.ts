import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

// Variables are private (server-only) unless marked `public: true`. Never mark a secret as public.
export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'PostgreSQL connection string (local Supabase, transaction pooler or Hyperdrive).',
		schema: z.url({ protocol: /^postgres(ql)?$/ })
	}
});
