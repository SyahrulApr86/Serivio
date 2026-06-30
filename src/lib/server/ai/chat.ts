import type OpenAI from 'openai';
import { getClient } from './providers';
import { tools, toolsByName } from './tools';

export type ChatEvent =
	| { type: 'tool'; name: string; summary: string }
	| { type: 'delta'; text: string }
	| { type: 'error'; message: string };

export type HistoryMessage = {
	role: 'user' | 'assistant';
	content: string;
	imageUrls?: string[];
};

const MAX_ROUNDS = 6;

const today = () => new Date().toISOString().slice(0, 10);

function systemPrompt(): string {
	return [
		'You are Serivio Assistant, the AI inside Serivio — a personal anime/manga/series tracker.',
		`Today is ${today()}.`,
		'You help the signed-in user manage THEIR OWN library: answer questions about it and perform CRUD via the provided tools.',
		'',
		'Guidelines:',
		'- Always call search_series to resolve a title to an id BEFORE update_series, set_progress, bump_progress, delete_series, or add/remove collection.',
		'- "I read/watched chapter/episode N of X" → search_series, then set_progress (absolute) or bump_progress (relative).',
		'- "I started X" with no status → use status "Watching" for video media, "Reading" for text media.',
		'- When the user attaches an image (its URL is given in the message), pass that URL as coverImage when creating/updating the series. Read the poster to infer title, media type, and genres when helpful.',
		'- Before delete_series, confirm with the user unless they were explicit.',
		'- Required to create a series: title, mediaType, status. Ask only if you cannot infer them.',
		'- Reply in the same language the user writes in (default Indonesian). Be concise and friendly. After acting, briefly confirm what you did.'
	].join('\n');
}

type Msg = OpenAI.Chat.Completions.ChatCompletionMessageParam;

function toOpenAiMessages(history: HistoryMessage[]): Msg[] {
	return history.map((m) => {
		if (m.role === 'user' && m.imageUrls?.length) {
			return {
				role: 'user',
				content: [
					{ type: 'text', text: m.content },
					...m.imageUrls.map((url) => ({ type: 'image_url' as const, image_url: { url } }))
				]
			};
		}
		return { role: m.role, content: m.content };
	});
}

const toolSpecs = tools.map((t) => ({
	type: 'function' as const,
	function: { name: t.name, description: t.description, parameters: t.parameters }
}));

/**
 * Runs the tool-calling loop for one user turn, streaming events. Yields `tool`
 * events as actions are taken and `delta` events for the assistant's final text.
 * Returns the full assistant text (for persistence).
 */
export async function* runChat(
	userId: string,
	history: HistoryMessage[],
	providerName?: string
): AsyncGenerator<ChatEvent, string, void> {
	const { client, model } = getClient(providerName);
	const messages: Msg[] = [{ role: 'system', content: systemPrompt() }, ...toOpenAiMessages(history)];

	let finalText = '';

	for (let round = 0; round < MAX_ROUNDS; round++) {
		const stream = await client.chat.completions.create({
			model,
			messages,
			tools: toolSpecs,
			tool_choice: 'auto',
			stream: true
		});

		let content = '';
		const toolCalls: { id: string; name: string; args: string }[] = [];

		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta;
			if (!delta) continue;
			if (delta.content) {
				content += delta.content;
				yield { type: 'delta', text: delta.content };
			}
			for (const tc of delta.tool_calls ?? []) {
				const i = tc.index;
				toolCalls[i] ??= { id: '', name: '', args: '' };
				if (tc.id) toolCalls[i].id = tc.id;
				if (tc.function?.name) toolCalls[i].name += tc.function.name;
				if (tc.function?.arguments) toolCalls[i].args += tc.function.arguments;
			}
		}

		const calls = toolCalls.filter((c) => c.name);
		if (calls.length === 0) {
			finalText += content;
			return finalText;
		}

		// Record the assistant turn that requested the tools.
		messages.push({
			role: 'assistant',
			content: content || null,
			tool_calls: calls.map((c) => ({
				id: c.id,
				type: 'function',
				function: { name: c.name, arguments: c.args || '{}' }
			}))
		});

		// Execute each tool and feed results back.
		for (const call of calls) {
			const tool = toolsByName.get(call.name);
			let result;
			if (!tool) {
				result = { data: { error: `unknown tool ${call.name}` }, summary: `Unknown tool ${call.name}` };
			} else {
				let args: Record<string, unknown>;
				try {
					args = call.args ? JSON.parse(call.args) : {};
				} catch {
					args = {};
				}
				try {
					result = await tool.execute(userId, args);
				} catch (e) {
					result = { data: { error: String(e) }, summary: `Error running ${call.name}` };
				}
			}
			yield { type: 'tool', name: call.name, summary: result.summary };
			messages.push({
				role: 'tool',
				tool_call_id: call.id,
				content: JSON.stringify(result.data)
			});
		}
	}

	// Hit the round cap; surface whatever text we have.
	return finalText || 'Maaf, permintaan terlalu kompleks. Coba pecah jadi langkah lebih kecil.';
}
