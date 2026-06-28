/**
 * Rebuilds the Elasticsearch index from Postgres (run via `bun run search:reindex`).
 */
import { db } from '../db';
import { series } from '../db/schema';
import { esFetch, INDEX } from './client';
import { ensureIndex, indexSeries } from './index';

async function main() {
	console.log('Reindexing…');
	await esFetch('DELETE', `/${INDEX}`);
	await ensureIndex(true);
	const rows = await db.select().from(series);
	for (const row of rows) {
		await indexSeries(row);
	}
	console.log(`Indexed ${rows.length} series into "${INDEX}".`);
	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
