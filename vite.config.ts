import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
	// Vite 8's SSR module runner does not auto-inject .env into process.env.
	// Do it here so server-only code reading process.env gets the correct values.
	const env = loadEnv(mode, process.cwd(), '');
	Object.assign(process.env, env);

	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				adapter: adapter()
			})
		],
		resolve: {
			alias: [
				// sveltekit-superforms barrel eagerly loads the typebox adapter which calls
				// `class X extends Type.Base` — typebox v1.3+ removed Base. Sub-paths must
				// be stubbed before the main entry so Rolldown resolves them first.
				{
					find: 'typebox/compile',
					replacement: path.resolve(__dirname, 'src/lib/typebox-compile-stub.js')
				},
				{
					find: 'typebox/format',
					replacement: path.resolve(__dirname, 'src/lib/typebox-format-stub.js')
				},
				{
					find: 'typebox',
					replacement: path.resolve(__dirname, 'src/lib/typebox-stub.js')
				}
			]
		}
	};
});
