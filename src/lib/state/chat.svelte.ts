/** Shared chat UI state (open/toggle, messages, conversation, provider). */

export type ToolAction = { name: string; summary: string };

export type ChatUiMessage = {
	role: 'user' | 'assistant';
	content: string;
	imageUrls?: string[];
	actions?: ToolAction[];
	pending?: boolean;
};

export type AiProviderName = 'gpt' | 'deepseek';

class ChatState {
	open = $state(false);
	messages = $state<ChatUiMessage[]>([]);
	conversationId = $state<string | null>(null);
	provider = $state<AiProviderName>('gpt');
	sending = $state(false);

	toggle() {
		this.open = !this.open;
	}

	/** Hydrate from server-loaded history (called once on mount). */
	hydrate(conversationId: string | null, messages: ChatUiMessage[]) {
		if (this.conversationId) return; // already initialised this session
		this.conversationId = conversationId;
		this.messages = messages;
	}
}

export const chat = new ChatState();
