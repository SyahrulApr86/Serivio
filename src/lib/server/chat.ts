import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from './db';
import {
	chatConversation,
	chatMessage,
	type ChatConversation,
	type ChatMessage,
	type ChatRole
} from './db/schema';

export async function latestConversation(userId: string): Promise<ChatConversation | undefined> {
	const [row] = await db
		.select()
		.from(chatConversation)
		.where(eq(chatConversation.userId, userId))
		.orderBy(desc(chatConversation.updatedAt))
		.limit(1);
	return row;
}

export async function getConversation(
	userId: string,
	id: string
): Promise<ChatConversation | undefined> {
	const [row] = await db
		.select()
		.from(chatConversation)
		.where(and(eq(chatConversation.id, id), eq(chatConversation.userId, userId)));
	return row;
}

export async function createConversation(userId: string): Promise<ChatConversation> {
	const [row] = await db.insert(chatConversation).values({ userId }).returning();
	return row;
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
	return db
		.select()
		.from(chatMessage)
		.where(eq(chatMessage.conversationId, conversationId))
		.orderBy(asc(chatMessage.createdAt));
}

export async function saveMessage(
	conversationId: string,
	role: ChatRole,
	content: string,
	imageUrls: string[] = []
): Promise<ChatMessage> {
	const [row] = await db
		.insert(chatMessage)
		.values({ conversationId, role, content, imageUrls })
		.returning();
	await db
		.update(chatConversation)
		.set({ updatedAt: new Date() })
		.where(eq(chatConversation.id, conversationId));
	return row;
}

/** Sets the conversation title from the first user message if not already set. */
export async function ensureTitle(conversationId: string, fromText: string): Promise<void> {
	const [conv] = await db
		.select({ title: chatConversation.title })
		.from(chatConversation)
		.where(eq(chatConversation.id, conversationId));
	if (conv && !conv.title) {
		const title = fromText.trim().slice(0, 60) || 'New chat';
		await db
			.update(chatConversation)
			.set({ title })
			.where(eq(chatConversation.id, conversationId));
	}
}
