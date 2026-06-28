import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { db } from './db';
import * as schema from './db/schema';
import { config } from './env';

export const auth = betterAuth({
	secret: config.auth.secret,
	baseURL: config.auth.url,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification
		}
	}),
	emailAndPassword: {
		enabled: true,
		// PRD wants username + password only; email verification is out of scope.
		requireEmailVerification: false,
		minPasswordLength: 6
	},
	plugins: [username()],
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24 // refresh daily
	}
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
