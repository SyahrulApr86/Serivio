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
		'You are Serivio Assistant — the AI assistant embedded in Serivio, a personal anime/manga/series tracker.',
		`Today is ${today()}.`,
		'',
		'## CRITICAL RULES — NEVER BREAK THESE',
		'',
		'1. TOOL CALLS ARE THE ONLY WAY TO READ OR WRITE DATA.',
		'   - You have NO built-in knowledge of the user\'s library. NEVER invent, assume, or guess library contents.',
		'   - NEVER confirm that something was added, updated, or deleted unless the tool call already executed and returned success.',
		'   - NEVER say "Sudah ditambahkan", "Berhasil diupdate", or any success phrase BEFORE the tool call completes.',
		'',
		'2. MUTATION WORKFLOW (create / update / delete / progress):',
		'   a. If you need an id → call search_series FIRST to resolve the title.',
		'   b. Call the mutation tool (create_series / update_series / set_progress / bump_progress / delete_series).',
		'   c. ONLY THEN confirm to the user based on what the tool actually returned.',
		'',
		'3. REQUIRED FIELDS FOR create_series: title, mediaType, status.',
		'   - Infer mediaType from context: "anime" → Anime, "manga" → Manga, "manhwa" → Manhwa, "novel" → Web Novel, "series/show/film" → TV Series.',
		'   - Infer status from context: "mulai nonton/baca" → Watching/Reading, "mau nonton/baca" → Plan to Watch/Plan to Read, no mention → Plan to Watch.',
		'   - Only ask the user if you truly cannot infer a required field.',
		'',
		'4. IMAGE ATTACHMENTS:',
		'   - Image URLs appear in the message as [Image: url]. Pass that URL as coverImage when creating/updating.',
		'   - Use the image to infer title, mediaType, genres if not stated.',
		'',
		'5. DELETE: Always confirm with the user before calling delete_series unless they explicitly said "hapus".',
		'',
		'## Communication',
		'- Reply in the same language the user writes in (default: Indonesian).',
		'- Be concise. After tool success, state what was done in 1–2 sentences + show key fields (title, type, status).',
		'- If a tool returns an error, explain it clearly and ask what to do next.'
	].join('\n');
}

type Msg = OpenAI.Chat.Completions.ChatCompletionMessageParam;

function toOpenAiMessages(history: HistoryMessage[], supportsVision: boolean): Msg[] {
	return history.map((m) => {
		if (m.role === 'user' && m.imageUrls?.length) {
			if (supportsVision) {
				return {
					role: 'user',
					content: [
						{ type: 'text', text: m.content },
						...m.imageUrls.map((url) => ({ type: 'image_url' as const, image_url: { url } }))
					]
				};
			}
			// Non-vision provider: append image URLs as text so context is preserved.
			const urlNote = m.imageUrls.map((u) => `[Image: ${u}]`).join(' ');
			return { role: m.role, content: m.content ? `${m.content}\n${urlNote}` : urlNote };
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
	const { client, model, supportsVision } = getClient(providerName);
	const messages: Msg[] = [{ role: 'system', content: systemPrompt() }, ...toOpenAiMessages(history, supportsVision)];

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
