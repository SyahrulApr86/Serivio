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
	databaseUrl: required('DATABASE_URL', 'postgres://serivio:serivio@localhost:5432/serivio'),
	auth: {
		secret: required('BETTER_AUTH_SECRET', 'dev-secret-change-me'),
		url: required('BETTER_AUTH_URL', 'http://localhost:5173')
	},
	redisUrl: required('REDIS_URL', 'redis://localhost:6379'),
	elasticsearch: {
		url: required('ELASTICSEARCH_URL', 'http://localhost:9200'),
		index: required('ELASTICSEARCH_INDEX', 'serivio-series')
	},
	minio: {
		endpoint: required('MINIO_ENDPOINT', 'localhost'),
		port: Number(required('MINIO_PORT', '9000')),
		useSSL: required('MINIO_USE_SSL', 'false') === 'true',
		accessKey: required('MINIO_ACCESS_KEY', 'minioadmin'),
		secretKey: required('MINIO_SECRET_KEY', 'minioadmin'),
		bucket: required('MINIO_BUCKET', 'serivio-covers'),
		publicUrl: required('MINIO_PUBLIC_URL', 'http://localhost:9000/serivio-covers')
	}
};
