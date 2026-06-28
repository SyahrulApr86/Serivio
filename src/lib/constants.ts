/** Shared client/server constants — safe to import anywhere (no server-only deps). */

export const MEDIA_TYPES = [
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
export type MediaType = (typeof MEDIA_TYPES)[number];

export const STATUSES = [
	'Watching',
	'Reading',
	'Completed',
	'On Hold',
	'Dropped',
	'Plan to Watch',
	'Plan to Read'
] as const;
export type Status = (typeof STATUSES)[number];

export const SORT_OPTIONS = [
	{ value: 'recent', label: 'Recently Updated' },
	{ value: 'opened', label: 'Last Opened' },
	{ value: 'rating', label: 'Rating' },
	{ value: 'alpha', label: 'Alphabetical' },
	{ value: 'progress', label: 'Progress' }
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]['value'];

/** Media that is read (chapter/page based) rather than watched (episode based). */
const READING_MEDIA: MediaType[] = [
	'Manga',
	'Manhwa',
	'Manhua',
	'Comic',
	'Light Novel',
	'Web Novel',
	'Novel',
	'Book'
];

export function isReadingMedia(media: MediaType): boolean {
	return READING_MEDIA.includes(media);
}

/** Unit label for the progress counter, e.g. "Episode" / "Chapter" / "Page". */
export function progressUnit(media: MediaType): string {
	if (media === 'Movie') return 'Watched';
	if (media === 'Novel' || media === 'Book') return 'Page';
	if (isReadingMedia(media)) return 'Chapter';
	return 'Episode';
}

export function progressVerb(media: MediaType): 'watch' | 'read' {
	return isReadingMedia(media) ? 'read' : 'watch';
}

/** Maps a status to a prism accent for badges/borders. */
export function statusAccent(status: Status): {
	wash: string;
	border: string;
	text: string;
	dot: string;
} {
	switch (status) {
		case 'Watching':
		case 'Reading':
			return {
				wash: 'bg-sky-wash',
				border: 'border-prism-blue/40',
				text: 'text-prism-blue',
				dot: 'bg-prism-blue'
			};
		case 'Completed':
			return {
				wash: 'bg-mint-wash',
				border: 'border-prism-green/40',
				text: 'text-prism-green',
				dot: 'bg-prism-green'
			};
		case 'On Hold':
			return {
				wash: 'bg-cream-wash',
				border: 'border-prism-yellow/50',
				text: 'text-[#a07b13]',
				dot: 'bg-prism-yellow'
			};
		case 'Dropped':
			return {
				wash: 'bg-blush-wash',
				border: 'border-prism-pink/40',
				text: 'text-prism-pink',
				dot: 'bg-prism-pink'
			};
		default:
			return {
				wash: 'bg-paper-white',
				border: 'border-ash-border',
				text: 'text-carbon-nav',
				dot: 'bg-carbon-nav'
			};
	}
}
