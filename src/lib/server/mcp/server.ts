import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { tools, toolsByName } from '$lib/server/ai/tools';

/**
 * Builds an MCP server whose tools are bound to a single user. The shared tool
 * registry (`ai/tools.ts`) backs both this server and the web chatbot, so an
 * external client (Claude Code, Codex) and the in-app chat behave identically.
 */
export function buildMcpServer(userId: string): Server {
	const server = new Server(
		{ name: 'serivio', version: '0.1.0' },
		{ capabilities: { tools: {} } }
	);

	server.setRequestHandler(ListToolsRequestSchema, async () => ({
		tools: tools.map((t) => ({
			name: t.name,
			description: t.description,
			inputSchema: t.parameters
		}))
	}));

	server.setRequestHandler(CallToolRequestSchema, async (req) => {
		const tool = toolsByName.get(req.params.name);
		if (!tool) {
			return { content: [{ type: 'text', text: `Unknown tool: ${req.params.name}` }], isError: true };
		}
		try {
			const result = await tool.execute(
				userId,
				(req.params.arguments ?? {}) as Record<string, unknown>
			);
			return { content: [{ type: 'text', text: JSON.stringify(result.data) }] };
		} catch (e) {
			return { content: [{ type: 'text', text: `Error: ${String(e)}` }], isError: true };
		}
	});

	return server;
}
