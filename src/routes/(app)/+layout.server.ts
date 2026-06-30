import { redirect } from '@sveltejs/kit';
import { listSeries } from '$lib/server/series';
import { latestConversation, getMessages } from '$lib/server/chat';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}
	const [allSeries, conv] = await Promise.all([
		listSeries(locals.user.id),
		latestConversation(locals.user.id)
	]);
	const messages = conv ? await getMessages(conv.id) : [];
	return {
		user: { id: locals.user.id, username: locals.user.username ?? locals.user.name },
		seriesIndex: allSeries.map((s) => ({
			id: s.id,
			title: s.title,
			altTitle: s.altTitle,
			coverImage: s.coverImage,
			mediaType: s.mediaType,
			status: s.status
		})),
		chat: {
			conversationId: conv?.id ?? null,
			messages: messages.map((m) => ({
				role: m.role,
				content: m.content,
				imageUrls: m.imageUrls
			}))
		}
	};
};
