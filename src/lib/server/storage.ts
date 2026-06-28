import { Client } from 'minio';
import { config } from './env';
import { createId } from './db/id';

export const minio = new Client({
	endPoint: config.minio.endpoint,
	port: config.minio.port,
	useSSL: config.minio.useSSL,
	accessKey: config.minio.accessKey,
	secretKey: config.minio.secretKey
});

let ensured = false;

/** Ensures the cover bucket exists and is publicly readable (dev convenience). */
export async function ensureBucket(): Promise<void> {
	if (ensured) return;
	const exists = await minio.bucketExists(config.minio.bucket).catch(() => false);
	if (!exists) {
		await minio.makeBucket(config.minio.bucket);
	}
	// Allow anonymous GET so <img src> works without signed URLs in dev.
	const policy = {
		Version: '2012-10-17',
		Statement: [
			{
				Effect: 'Allow',
				Principal: { AWS: ['*'] },
				Action: ['s3:GetObject'],
				Resource: [`arn:aws:s3:::${config.minio.bucket}/*`]
			}
		]
	};
	await minio.setBucketPolicy(config.minio.bucket, JSON.stringify(policy)).catch(() => {});
	ensured = true;
}

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const EXT: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/avif': 'avif'
};

/** Uploads a cover image File and returns its public URL. */
export async function uploadCover(file: File, userId: string): Promise<string> {
	if (!ALLOWED.has(file.type)) {
		throw new Error('Unsupported image type');
	}
	if (file.size > 5 * 1024 * 1024) {
		throw new Error('Image must be under 5MB');
	}
	await ensureBucket();
	const key = `${userId}/${createId(12)}.${EXT[file.type]}`;
	const buf = Buffer.from(await file.arrayBuffer());
	await minio.putObject(config.minio.bucket, key, buf, buf.length, {
		'Content-Type': file.type
	});
	return `${config.minio.publicUrl}/${key}`;
}
