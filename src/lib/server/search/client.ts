import { config } from '../env';

export const INDEX = config.elasticsearch.index;
const BASE = config.elasticsearch.url.replace(/\/$/, '');

export type EsResponse<T = unknown> = { ok: boolean; status: number; body: T };

/**
 * Minimal Elasticsearch REST client over fetch.
 * The official @elastic/elasticsearch transport hangs under the Bun runtime,
 * and our needs (create index, index/delete doc, search) map cleanly to REST.
 */
export async function esFetch<T = unknown>(
	method: string,
	path: string,
	body?: unknown
): Promise<EsResponse<T>> {
	const res = await fetch(`${BASE}${path}`, {
		method,
		headers: body ? { 'content-type': 'application/json' } : undefined,
		body: body === undefined ? undefined : JSON.stringify(body)
	});
	const text = await res.text();
	const parsed = text ? JSON.parse(text) : {};
	return { ok: res.ok, status: res.status, body: parsed as T };
}
