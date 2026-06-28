/** Tiny classnames joiner (no external dep). */
export function cn(...parts: Array<string | false | null | undefined>): string {
	return parts.filter(Boolean).join(' ');
}

export function formatRelative(date: Date | string | number): string {
	const d = new Date(date);
	const diff = Date.now() - d.getTime();
	const sec = Math.floor(diff / 1000);
	const min = Math.floor(sec / 60);
	const hr = Math.floor(min / 60);
	const day = Math.floor(hr / 24);
	if (sec < 60) return 'just now';
	if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
	if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
	if (day === 1) return 'Yesterday';
	if (day < 7) return `${day} days ago`;
	if (day < 30) return `${Math.floor(day / 7)} week${day < 14 ? '' : 's'} ago`;
	return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
