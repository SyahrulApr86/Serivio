/**
 * Central server config. Reads from process.env so the same modules work
 * both inside SvelteKit (Node runtime) and in standalone Bun scripts
 * (migrate/seed/reindex), where $env/dynamic/private is unavailable.
 */
function required(key: string, fallback?: string): string {
	const value = process.env[key] ?? fallback;
	if (value === undefined) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

export const config = {
	databaseUrl: required('DATABASE_URL', 'postgres://serivio:serivio@localhost:5437/serivio'),
	auth: {
		secret: required('BETTER_AUTH_SECRET', 'dev-secret-change-me'),
		url: required('BETTER_AUTH_URL', 'http://localhost:5173')
	},
	redisUrl: required('REDIS_URL', 'redis://localhost:6379'),
	minio: {
		endpoint: required('MINIO_ENDPOINT', 'localhost'),
		port: Number(required('MINIO_PORT', '9000')),
		useSSL: required('MINIO_USE_SSL', 'false') === 'true',
		accessKey: required('MINIO_ACCESS_KEY', 'minioadmin'),
		secretKey: required('MINIO_SECRET_KEY', 'minioadmin'),
		bucket: required('MINIO_BUCKET', 'serivio-covers'),
		publicUrl: required('MINIO_PUBLIC_URL', 'http://localhost:9000/serivio-covers')
	},
	/**
	 * AI providers (OpenAI-compatible). The default provider powers the in-app
	 * chatbot; users can switch per-conversation. Keys are read lazily (see
	 * `aiProvider`) so the app still boots when AI is not configured.
	 */
	ai: {
		defaultProvider: required('AI_DEFAULT_PROVIDER', 'gpt') // 'gpt' | 'deepseek'
	},
	/** MCP server (standalone process) settings. */
	mcp: {
		port: Number(required('MCP_PORT', '3001'))
	}
};

export type AiProvider = 'gpt' | 'deepseek';

type AiProviderConfig = { baseUrl: string; apiKey: string; model: string };

/**
 * Resolves an AI provider's connection config from the environment. Throws only
 * when the chosen provider is actually used, so a missing key never blocks boot.
 */
export function aiProvider(name: AiProvider): AiProviderConfig {
	if (name === 'deepseek') {
		return {
			baseUrl: required('AI_DEEPSEEK_BASE_URL', 'https://api.deepseek.com'),
			apiKey: required('AI_DEEPSEEK_API_KEY'),
			model: required('AI_DEEPSEEK_MODEL', 'deepseek-chat')
		};
	}
	return {
		baseUrl: required('AI_GPT_BASE_URL', 'https://api.bluesminds.com/v1'),
		apiKey: required('AI_GPT_API_KEY'),
		model: required('AI_GPT_MODEL', 'gpt-5.5')
	};
}
