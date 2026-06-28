/**
 * Seed script (run via `bun run db:seed`).
 * Creates a demo user and sample series mirroring the PRD examples.
 */
import { eq } from 'drizzle-orm';
import { db } from './index';
import { user, series, progressHistory, collection, collectionItem } from './schema';
import { auth } from '../auth';
import type { MediaType, Status } from './schema';

const DEMO = { username: 'demo', email: 'demo@serivio.local', password: 'password123', name: 'Demo' };

type SeedSeries = {
	title: string;
	altTitle?: string;
	mediaType: MediaType;
	status: Status;
	currentProgress: number;
	totalProgress?: number;
	currentVolume?: number;
	rating?: number;
	author?: string;
	studioPublisher?: string;
	releaseYear?: number;
	genres?: string[];
	tags?: string[];
	description?: string;
};

const SAMPLES: SeedSeries[] = [
	{
		title: 'Solo Leveling',
		altTitle: 'Na Honjaman Level Up',
		mediaType: 'Manhwa',
		status: 'Reading',
		currentProgress: 233,
		author: 'Chugong',
		studioPublisher: 'D&C Media',
		releaseYear: 2018,
		genres: ['Action', 'Fantasy'],
		tags: ['favorites', 'op-mc'],
		rating: 9.2
	},
	{
		title: 'One Piece',
		mediaType: 'Manga',
		status: 'Reading',
		currentProgress: 1158,
		author: 'Eiichiro Oda',
		studioPublisher: 'Shueisha',
		releaseYear: 1997,
		genres: ['Adventure', 'Comedy', 'Fantasy'],
		tags: ['favorites', 'long-running'],
		rating: 9.5
	},
	{
		title: 'Frieren: Beyond Journey’s End',
		altTitle: 'Sousou no Frieren',
		mediaType: 'Anime',
		status: 'Watching',
		currentProgress: 18,
		totalProgress: 28,
		studioPublisher: 'Madhouse',
		releaseYear: 2023,
		genres: ['Adventure', 'Drama', 'Fantasy'],
		tags: ['weekend'],
		rating: 9.0
	},
	{
		title: 'Chainsaw Man',
		mediaType: 'Manga',
		status: 'Reading',
		currentProgress: 183,
		author: 'Tatsuki Fujimoto',
		studioPublisher: 'Shueisha',
		releaseYear: 2018,
		genres: ['Action', 'Horror'],
		tags: ['weekly'],
		rating: 8.7
	},
	{
		title: 'Attack on Titan',
		altTitle: 'Shingeki no Kyojin',
		mediaType: 'Anime',
		status: 'Completed',
		currentProgress: 87,
		totalProgress: 87,
		studioPublisher: 'Wit Studio / MAPPA',
		releaseYear: 2013,
		genres: ['Action', 'Drama'],
		tags: ['favorites'],
		rating: 9.3
	},
	{
		title: 'Breaking Bad',
		mediaType: 'TV Series',
		status: 'Completed',
		currentProgress: 62,
		totalProgress: 62,
		studioPublisher: 'AMC',
		releaseYear: 2008,
		genres: ['Crime', 'Drama', 'Thriller'],
		tags: ['favorites'],
		rating: 9.5
	},
	{
		title: 'The Beginning After The End',
		altTitle: 'TBATE',
		mediaType: 'Web Novel',
		status: 'Reading',
		currentProgress: 420,
		author: 'TurtleMe',
		genres: ['Action', 'Fantasy', 'Isekai'],
		tags: ['favorites'],
		rating: 8.5
	},
	{
		title: 'Grand Blue Dreaming',
		altTitle: 'Grand Blue',
		mediaType: 'Manga',
		status: 'On Hold',
		currentProgress: 88,
		author: 'Kenji Inoue',
		genres: ['Comedy', 'Slice of Life'],
		tags: ['comedy'],
		rating: 8.8
	}
];

async function main() {
	console.log('Seeding…');

	// Reuse existing demo user if present, else create via Better Auth (hashes password).
	let demoUser = (await db.select().from(user).where(eq(user.username, DEMO.username)))[0];
	if (!demoUser) {
		await auth.api.signUpEmail({
			body: {
				name: DEMO.name,
				email: DEMO.email,
				password: DEMO.password,
				username: DEMO.username
			}
		});
		demoUser = (await db.select().from(user).where(eq(user.username, DEMO.username)))[0];
		console.log(`Created demo user (username: ${DEMO.username}, password: ${DEMO.password})`);
	} else {
		console.log('Demo user already exists, reusing.');
	}

	// Wipe existing demo data for idempotency.
	await db.delete(series).where(eq(series.userId, demoUser.id));
	await db.delete(collection).where(eq(collection.userId, demoUser.id));

	const now = Date.now();
	for (let i = 0; i < SAMPLES.length; i++) {
		const s = SAMPLES[i];
		const lastActivity = new Date(now - i * 36 * 60 * 60 * 1000); // staggered
		const [row] = await db
			.insert(series)
			.values({
				userId: demoUser.id,
				title: s.title,
				altTitle: s.altTitle,
				mediaType: s.mediaType,
				status: s.status,
				currentProgress: s.currentProgress,
				totalProgress: s.totalProgress,
				currentVolume: s.currentVolume,
				rating: s.rating,
				author: s.author,
				studioPublisher: s.studioPublisher,
				releaseYear: s.releaseYear,
				genres: s.genres ?? [],
				tags: s.tags ?? [],
				description: s.description,
				lastActivityAt: lastActivity,
				lastOpenedAt: lastActivity
			})
			.returning();

		// A couple of history rows so detail pages have content.
		await db.insert(progressHistory).values([
			{
				seriesId: row.id,
				kind: 'progress',
				fromValue: s.currentProgress - 1,
				toValue: s.currentProgress,
				createdAt: lastActivity
			},
			{
				seriesId: row.id,
				kind: 'progress',
				fromValue: s.currentProgress - 2,
				toValue: s.currentProgress - 1,
				createdAt: new Date(lastActivity.getTime() - 24 * 60 * 60 * 1000)
			}
		]);
	}

	// Sample collection: Favorites
	const favTitles = ['Solo Leveling', 'One Piece', 'Attack on Titan', 'Breaking Bad'];
	const [fav] = await db
		.insert(collection)
		.values({ userId: demoUser.id, name: 'Favorites' })
		.returning();
	const rows = await db.select().from(series).where(eq(series.userId, demoUser.id));
	for (const r of rows) {
		if (favTitles.includes(r.title)) {
			await db.insert(collectionItem).values({ collectionId: fav.id, seriesId: r.id });
		}
	}

	console.log(`Seeded ${SAMPLES.length} series + 1 collection for "${DEMO.username}".`);
	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
