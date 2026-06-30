import { error } from '@sveltejs/kit';
import { runChat, type HistoryMessage } from '$lib/server/ai/chat';
import {
	getConversation,
	createConversation,
	getMessages,
	saveMessage,
	ensureTitle
} from '$lib/server/chat';
import type { RequestHandler } from './$types';

type Body = {
	conversationId?: string;
	message?: string;
	imageUrls?: string[];
	provider?: string;
};

const sse = (event: string, data: unknown) =>
	new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const userId = locals.user.id;

	const body = (await request.json()) as Body;
	const message = (body.message ?? '').trim();
	const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls.filter((u) => typeof u === 'string') : [];
	if (!message && imageUrls.length === 0) throw error(400, 'Empty message');

	// Resolve (and own-check) or create the conversation.
	let conversation = body.conversationId
		? await getConversation(userId, body.conversationId)
		: undefined;
	if (body.conversationId && !conversation) throw error(404, 'Conversation not found');
	if (!conversation) conversation = await createConversation(userId);
	const conversationId = conversation.id;

	// Build history from persisted messages, then append the new user message.
	const prior = await getMessages(conversationId);
	const history: HistoryMessage[] = prior.map((m) => ({
		role: m.role,
		content: m.content,
		imageUrls: m.imageUrls
	}));
	history.push({ role: 'user', content: message, imageUrls });

	await saveMessage(conversationId, 'user', message, imageUrls);
	await ensureTitle(conversationId, message);

	const stream = new ReadableStream({
		async start(controller) {
			controller.enqueue(sse('meta', { conversationId }));
			let assistantText = '';
			try {
				const gen = runChat(userId, history, body.provider);
				let next = await gen.next();
				while (!next.done) {
					const ev = next.value;
					if (ev.type === 'delta') assistantText += ev.text;
					controller.enqueue(sse(ev.type, ev));
					next = await gen.next();
				}
				assistantText = next.value || assistantText;
			} catch (e) {
				controller.enqueue(sse('error', { message: String(e) }));
			}
			const saved = await saveMessage(conversationId, 'assistant', assistantText);
			controller.enqueue(sse('done', { conversationId, messageId: saved.id }));
			controller.close();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
