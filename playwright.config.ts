import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/e2e',
	testMatch: '**/*.e2e.ts',
	webServer: { command: 'pnpm run build && pnpm run preview', port: 4173 }
});
