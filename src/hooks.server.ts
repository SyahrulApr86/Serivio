import { auth } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

const PROTECTED_PREFIXES = [
	'/dashboard',
	'/library',
	'/series',
	'/collections',
	'/stats',
	'/add',
	'/settings'
];
const GUEST_ONLY = ['/login', '/register'];

export const handle: Handle = async ({ event, resolve }) => {
	// Resolve current session and expose it on locals.
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = session?.user ?? null;
	event.locals.session = session?.session ?? null;

	const path = event.url.pathname;

	if (
		!event.locals.user &&
		PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))
	) {
		throw redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
	}

	if (event.locals.user && GUEST_ONLY.includes(path)) {
		throw redirect(302, '/dashboard');
	}

	return resolve(event);
};
