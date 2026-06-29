import { defineConfig } from '@playwright/test';

const usePreview = !!process.env.USE_PREVIEW;

export default defineConfig({
	testDir: './e2e',
	timeout: 30_000,
	retries: 1,
	fullyParallel: false,
	workers: 1,
	use: {
		baseURL: usePreview ? 'http://localhost:4173' : 'http://localhost:5173',
		trace: 'on-first-retry'
	},
	webServer: usePreview
		? {
				command: 'bun run build && bun run preview --port 4173',
				port: 4173,
				reuseExistingServer: true,
				timeout: 120_000
			}
		: {
				command: 'bun run dev',
				port: 5173,
				reuseExistingServer: true,
				timeout: 60_000
			}
});
