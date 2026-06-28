import { randomBytes } from 'node:crypto';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Short, URL-safe, collision-resistant id. */
export function createId(size = 16): string {
	const bytes = randomBytes(size);
	let id = '';
	for (let i = 0; i < size; i++) {
		id += ALPHABET[bytes[i] % ALPHABET.length];
	}
	return id;
}
