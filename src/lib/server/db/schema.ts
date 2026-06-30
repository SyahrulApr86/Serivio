import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	real,
	pgEnum,
	uniqueIndex,
	index,
	primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from './id';

/* ── Enums ──────────────────────────────────────────────────────── */
export const mediaTypes = [
	'Anime',
	'TV Series',
	'Movie',
	'Manga',
	'Manhwa',
	'Manhua',
	'Comic',
	'Light Novel',
	'Web Novel',
	'Novel',
	'Book'
] as const;
export type MediaType = (typeof mediaTypes)[number];
export const mediaTypeEnum = pgEnum('media_type', mediaTypes);

export const statuses = [
	'Watching',
	'Reading',
	'Completed',
	'On Hold',
	'Dropped',
	'Plan to Watch',
	'Plan to Read'
] as const;
export type Status = (typeof statuses)[number];
export const statusEnum = pgEnum('status', statuses);

export const historyKinds = ['progress', 'status', 'created'] as const;
export type HistoryKind = (typeof historyKinds)[number];
export const historyKindEnum = pgEnum('history_kind', historyKinds);

export const chatRoles = ['user', 'assistant'] as const;
export type ChatRole = (typeof chatRoles)[number];
export const chatRoleEnum = pgEnum('chat_role', chatRoles);

/* ── Better Auth tables ─────────────────────────────────────────── */
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified')
		.$defaultFn(() => false)
		.notNull(),
	image: text('image'),
	username: text('username').unique(),
	displayUsername: text('display_username'),
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').$defaultFn(() => new Date()),
	updatedAt: timestamp('updated_at').$defaultFn(() => new Date())
});

/* ── Domain: series ─────────────────────────────────────────────── */
export const series = pgTable(
	'series',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		altTitle: text('alt_title'),
		coverImage: text('cover_image'),
		mediaType: mediaTypeEnum('media_type').notNull(),
		status: statusEnum('status').notNull(),
		currentProgress: integer('current_progress').default(0).notNull(),
		totalProgress: integer('total_progress'),
		season: integer('season'),
		currentVolume: integer('current_volume'),
		currentPage: integer('current_page'),
		rating: real('rating'),
		notes: text('notes'),
		description: text('description'),
		author: text('author'),
		studioPublisher: text('studio_publisher'),
		releaseYear: integer('release_year'),
		genres: text('genres').array().default([]).notNull(),
		tags: text('tags').array().default([]).notNull(),
		lastActivityAt: timestamp('last_activity_at')
			.$defaultFn(() => new Date())
			.notNull(),
		lastOpenedAt: timestamp('last_opened_at'),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp('updated_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(t) => [
		index('series_user_idx').on(t.userId),
		index('series_status_idx').on(t.status),
		index('series_media_idx').on(t.mediaType),
		index('series_activity_idx').on(t.lastActivityAt)
	]
);

export const progressHistory = pgTable(
	'progress_history',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		seriesId: text('series_id')
			.notNull()
			.references(() => series.id, { onDelete: 'cascade' }),
		kind: historyKindEnum('kind').default('progress').notNull(),
		fromValue: integer('from_value'),
		toValue: integer('to_value'),
		note: text('note'),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(t) => [index('history_series_idx').on(t.seriesId)]
);

export const collection = pgTable(
	'collection',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(t) => [uniqueIndex('collection_user_name_idx').on(t.userId, t.name)]
);

export const collectionItem = pgTable(
	'collection_item',
	{
		collectionId: text('collection_id')
			.notNull()
			.references(() => collection.id, { onDelete: 'cascade' }),
		seriesId: text('series_id')
			.notNull()
			.references(() => series.id, { onDelete: 'cascade' }),
		addedAt: timestamp('added_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(t) => [primaryKey({ columns: [t.collectionId, t.seriesId] })]
);

/* ── Domain: AI chat ────────────────────────────────────────────── */
export const chatConversation = pgTable(
	'chat_conversation',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		title: text('title'),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp('updated_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(t) => [index('chat_conversation_user_idx').on(t.userId)]
);

export const chatMessage = pgTable(
	'chat_message',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		conversationId: text('conversation_id')
			.notNull()
			.references(() => chatConversation.id, { onDelete: 'cascade' }),
		role: chatRoleEnum('role').notNull(),
		content: text('content').notNull(),
		imageUrls: text('image_urls').array().default([]).notNull(),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(t) => [index('chat_message_conversation_idx').on(t.conversationId)]
);

/* ── API tokens (MCP / programmatic access) ─────────────────────── */
export const apiToken = pgTable(
	'api_token',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		token: text('token').notNull().unique(),
		name: text('name').notNull(),
		lastUsedAt: timestamp('last_used_at'),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(t) => [index('api_token_user_idx').on(t.userId)]
);

/* ── Relations ──────────────────────────────────────────────────── */
export const seriesRelations = relations(series, ({ one, many }) => ({
	user: one(user, { fields: [series.userId], references: [user.id] }),
	history: many(progressHistory),
	collectionItems: many(collectionItem)
}));

export const progressHistoryRelations = relations(progressHistory, ({ one }) => ({
	series: one(series, { fields: [progressHistory.seriesId], references: [series.id] })
}));

export const collectionRelations = relations(collection, ({ one, many }) => ({
	user: one(user, { fields: [collection.userId], references: [user.id] }),
	items: many(collectionItem)
}));

export const collectionItemRelations = relations(collectionItem, ({ one }) => ({
	collection: one(collection, {
		fields: [collectionItem.collectionId],
		references: [collection.id]
	}),
	series: one(series, { fields: [collectionItem.seriesId], references: [series.id] })
}));

export const chatConversationRelations = relations(chatConversation, ({ one, many }) => ({
	user: one(user, { fields: [chatConversation.userId], references: [user.id] }),
	messages: many(chatMessage)
}));

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
	conversation: one(chatConversation, {
		fields: [chatMessage.conversationId],
		references: [chatConversation.id]
	})
}));

export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type ProgressHistory = typeof progressHistory.$inferSelect;
export type Collection = typeof collection.$inferSelect;
export type ChatConversation = typeof chatConversation.$inferSelect;
export type ChatMessage = typeof chatMessage.$inferSelect;
export type NewChatMessage = typeof chatMessage.$inferInsert;
export type ApiToken = typeof apiToken.$inferSelect;
