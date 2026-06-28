import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

// Better Auth REST endpoints. A dedicated catch-all route is more reliable
// across dev and the production (adapter-node) build than the hook-only mount.
export const GET: RequestHandler = ({ request }) => auth.handler(request);
export const POST: RequestHandler = ({ request }) => auth.handler(request);
