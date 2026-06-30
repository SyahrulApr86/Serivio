import OpenAI from 'openai';
import { config, aiProvider, type AiProvider } from '$lib/server/env';

/** Resolves a provider name, falling back to the configured default. */
export function resolveProvider(name?: string): AiProvider {
	if (name === 'gpt' || name === 'deepseek') return name;
	return config.ai.defaultProvider === 'deepseek' ? 'deepseek' : 'gpt';
}

/** Vision-capable providers — can receive image_url content parts. */
const VISION_PROVIDERS = new Set<AiProvider>(['gpt']);

/** Builds an OpenAI-compatible client + model for the given provider. */
export function getClient(name?: string): { client: OpenAI; model: string; provider: AiProvider; supportsVision: boolean } {
	const provider = resolveProvider(name);
	const cfg = aiProvider(provider);
	const client = new OpenAI({ baseURL: cfg.baseUrl, apiKey: cfg.apiKey });
	return { client, model: cfg.model, provider, supportsVision: VISION_PROVIDERS.has(provider) };
}
