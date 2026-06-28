import * as v from 'valibot';
import { MEDIA_TYPES, STATUSES } from '$lib/constants';

const optionalInt = v.optional(
	v.nullable(v.pipe(v.number('Must be a number'), v.integer(), v.minValue(0)))
);

const optionalText = v.optional(v.pipe(v.string(), v.trim()), '');

export const seriesSchema = v.object({
	title: v.pipe(v.string(), v.trim(), v.minLength(1, 'Title is required'), v.maxLength(200)),
	altTitle: optionalText,
	coverImage: v.optional(v.pipe(v.string(), v.trim()), ''),
	mediaType: v.picklist(MEDIA_TYPES, 'Select a media type'),
	status: v.picklist(STATUSES, 'Select a status'),
	currentProgress: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
	totalProgress: optionalInt,
	season: optionalInt,
	currentVolume: optionalInt,
	currentPage: optionalInt,
	rating: v.optional(
		v.nullable(v.pipe(v.number(), v.minValue(0, 'Min 0'), v.maxValue(10, 'Max 10')))
	),
	releaseYear: v.optional(
		v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1800), v.maxValue(2200)))
	),
	author: optionalText,
	studioPublisher: optionalText,
	description: optionalText,
	notes: optionalText,
	genres: v.optional(v.string(), ''),
	tags: v.optional(v.string(), '')
});

export type SeriesInput = v.InferOutput<typeof seriesSchema>;

/** Splits a comma-separated string into a trimmed, de-duplicated list. */
export function splitCsv(value: string | null | undefined): string[] {
	if (!value) return [];
	return [
		...new Set(
			value
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)
		)
	];
}
