import { and, desc, eq } from 'drizzle-orm';
import { db } from './db';
import { apiToken, type ApiToken } from './db/schema';
import { createId } from './db/id';

/** API tokens grant programmatic (MCP) access on behalf of a user. */

export async function listTokens(userId: string): Promise<Omit<ApiToken, 'token'>[]> {
	return db
		.select({
			id: apiToken.id,
			userId: apiToken.userId,
			name: apiToken.name,
			lastUsedAt: apiToken.lastUsedAt,
			createdAt: apiToken.createdAt
		})
		.from(apiToken)
		.where(eq(apiToken.userId, userId))
		.orderBy(desc(apiToken.createdAt));
}

/** Creates a token and returns the raw secret (shown to the user once). */
export async function createToken(userId: string, name: string): Promise<string> {
	const token = `srv_${createId(32)}`;
	await db.insert(apiToken).values({ userId, name, token });
	return token;
}

export async function revokeToken(userId: string, id: string): Promise<boolean> {
	const res = await db
		.delete(apiToken)
		.where(and(eq(apiToken.id, id), eq(apiToken.userId, userId)))
		.returning({ id: apiToken.id });
	return res.length > 0;
}

/** Resolves a bearer token to its owner's userId, updating lastUsedAt. */
export async function userIdForToken(token: string): Promise<string | null> {
	const [row] = await db.select().from(apiToken).where(eq(apiToken.token, token));
	if (!row) return null;
	await db.update(apiToken).set({ lastUsedAt: new Date() }).where(eq(apiToken.id, row.id));
	return row.userId;
}
