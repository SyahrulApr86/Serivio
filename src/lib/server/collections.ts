import { and, eq, sql } from 'drizzle-orm';
import { db } from './db';
import { collection, collectionItem, type Collection } from './db/schema';

/**
 * Collection data access, user-scoped. Extracted from the inline route logic so
 * the same operations back the web routes, the AI chatbot, and the MCP server.
 */

export type CollectionWithCount = {
	id: string;
	name: string;
	description: string | null;
	createdAt: Date;
	count: number;
};

export async function listCollections(userId: string): Promise<CollectionWithCount[]> {
	return db
		.select({
			id: collection.id,
			name: collection.name,
			description: collection.description,
			createdAt: collection.createdAt,
			count: sql<number>`count(${collectionItem.seriesId})::int`
		})
		.from(collection)
		.leftJoin(collectionItem, eq(collectionItem.collectionId, collection.id))
		.where(eq(collection.userId, userId))
		.groupBy(collection.id)
		.orderBy(collection.createdAt);
}

export async function getCollection(
	userId: string,
	id: string
): Promise<Collection | undefined> {
	const [row] = await db
		.select()
		.from(collection)
		.where(and(eq(collection.id, id), eq(collection.userId, userId)));
	return row;
}

export class DuplicateCollectionError extends Error {
	constructor() {
		super('A collection with that name already exists');
		this.name = 'DuplicateCollectionError';
	}
}

/** Creates a collection. Throws {@link DuplicateCollectionError} on name clash. */
export async function createCollection(
	userId: string,
	name: string,
	description?: string | null
): Promise<Collection> {
	try {
		const [row] = await db
			.insert(collection)
			.values({ userId, name, description: description ?? null })
			.returning();
		return row;
	} catch {
		throw new DuplicateCollectionError();
	}
}

export async function deleteCollection(userId: string, id: string): Promise<boolean> {
	const result = await db
		.delete(collection)
		.where(and(eq(collection.id, id), eq(collection.userId, userId)))
		.returning({ id: collection.id });
	return result.length > 0;
}

/** Adds a series to a collection (no-op if already present). Verifies ownership of both. */
export async function addToCollection(
	userId: string,
	collectionId: string,
	seriesId: string
): Promise<boolean> {
	const col = await getCollection(userId, collectionId);
	if (!col) return false;
	await db
		.insert(collectionItem)
		.values({ collectionId, seriesId })
		.onConflictDoNothing();
	return true;
}

export async function removeFromCollection(
	userId: string,
	collectionId: string,
	seriesId: string
): Promise<boolean> {
	const col = await getCollection(userId, collectionId);
	if (!col) return false;
	await db
		.delete(collectionItem)
		.where(
			and(eq(collectionItem.collectionId, collectionId), eq(collectionItem.seriesId, seriesId))
		);
	return true;
}

/** Toggles membership; returns the resulting state ('added' | 'removed') or null if not owned. */
export async function toggleCollectionMembership(
	userId: string,
	collectionId: string,
	seriesId: string
): Promise<'added' | 'removed' | null> {
	const col = await getCollection(userId, collectionId);
	if (!col) return null;
	const existing = await db
		.select()
		.from(collectionItem)
		.where(
			and(eq(collectionItem.collectionId, collectionId), eq(collectionItem.seriesId, seriesId))
		);
	if (existing.length) {
		await db
			.delete(collectionItem)
			.where(
				and(eq(collectionItem.collectionId, collectionId), eq(collectionItem.seriesId, seriesId))
			);
		return 'removed';
	}
	await db.insert(collectionItem).values({ collectionId, seriesId });
	return 'added';
}
