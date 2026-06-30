/**
 * Standalone MCP server (run via `bun run mcp:dev`, or the bundled
 * `build-mcp/mcp-server.js` in production). Exposes Serivio's library tools over
 * the Streamable HTTP transport, authenticated by a per-user bearer token.
 */
import http from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { buildMcpServer } from '$lib/server/mcp/server';
import { userIdForToken } from '$lib/server/tokens';
import { config } from '$lib/server/env';

function send(res: http.ServerResponse, status: number, body: unknown) {
	res.writeHead(status, { 'content-type': 'application/json' });
	res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
	const path = (req.url ?? '').split('?')[0];
	if (path !== '/mcp') return send(res, 404, { error: 'not found' });

	const header = req.headers['authorization'];
	const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : null;
	const userId = token ? await userIdForToken(token) : null;
	if (!userId) return send(res, 401, { error: 'unauthorized' });

	let raw = '';
	for await (const chunk of req) raw += chunk;
	let parsed: unknown;
	try {
		parsed = raw ? JSON.parse(raw) : undefined;
	} catch {
		return send(res, 400, { error: 'invalid JSON' });
	}

	// Stateless: a fresh server + transport per request, bound to this user.
	const mcp = buildMcpServer(userId);
	const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
	res.on('close', () => {
		transport.close();
		mcp.close();
	});
	await mcp.connect(transport);
	await transport.handleRequest(req, res, parsed);
});

server.listen(config.mcp.port, () => {
	console.log(`Serivio MCP server listening on :${config.mcp.port}/mcp`);
});
