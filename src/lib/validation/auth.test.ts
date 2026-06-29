import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { usernameSchema, passwordSchema, registerSchema, loginSchema, flatten } from './auth';

describe('usernameSchema', () => {
	it('accepts a valid username', () => {
		const result = v.safeParse(usernameSchema, 'hello');
		expect(result.success).toBe(true);
	});

	it('accepts username with numbers and underscore', () => {
		const result = v.safeParse(usernameSchema, 'user_123');
		expect(result.success).toBe(true);
	});

	it('rejects username too short (2 chars)', () => {
		const result = v.safeParse(usernameSchema, 'ab');
		expect(result.success).toBe(false);
	});

	it('rejects username too long (31 chars)', () => {
		const result = v.safeParse(usernameSchema, 'a'.repeat(31));
		expect(result.success).toBe(false);
	});

	it('accepts username of exactly 3 characters', () => {
		const result = v.safeParse(usernameSchema, 'abc');
		expect(result.success).toBe(true);
	});

	it('accepts username of exactly 30 characters', () => {
		const result = v.safeParse(usernameSchema, 'a'.repeat(30));
		expect(result.success).toBe(true);
	});

	it('rejects username with spaces', () => {
		const result = v.safeParse(usernameSchema, 'hello world');
		expect(result.success).toBe(false);
	});

	it('rejects username with special char $', () => {
		const result = v.safeParse(usernameSchema, 'user$name');
		expect(result.success).toBe(false);
	});

	it('rejects username with special char @', () => {
		const result = v.safeParse(usernameSchema, 'user@name');
		expect(result.success).toBe(false);
	});
});

describe('passwordSchema', () => {
	it('accepts a valid password', () => {
		const result = v.safeParse(passwordSchema, '123456');
		expect(result.success).toBe(true);
	});

	it('accepts password at exactly 6 characters', () => {
		const result = v.safeParse(passwordSchema, 'abcdef');
		expect(result.success).toBe(true);
	});

	it('rejects password too short (5 chars)', () => {
		const result = v.safeParse(passwordSchema, '12345');
		expect(result.success).toBe(false);
	});

	it('rejects password too long (129 chars)', () => {
		const result = v.safeParse(passwordSchema, 'a'.repeat(129));
		expect(result.success).toBe(false);
	});

	it('accepts password of exactly 128 characters', () => {
		const result = v.safeParse(passwordSchema, 'a'.repeat(128));
		expect(result.success).toBe(true);
	});

	it('accepts a complex password with special characters', () => {
		const result = v.safeParse(passwordSchema, 'P@ssw0rd!#$%');
		expect(result.success).toBe(true);
	});
});

describe('registerSchema', () => {
	it('accepts valid username and password', () => {
		const result = v.safeParse(registerSchema, { username: 'hello', password: '123456' });
		expect(result.success).toBe(true);
	});

	it('rejects short username', () => {
		const result = v.safeParse(registerSchema, { username: 'ab', password: '123456' });
		expect(result.success).toBe(false);
	});

	it('rejects short password', () => {
		const result = v.safeParse(registerSchema, { username: 'hello', password: '12345' });
		expect(result.success).toBe(false);
	});
});

describe('loginSchema', () => {
	it('accepts valid login credentials', () => {
		const result = v.safeParse(loginSchema, { username: 'hello', password: 'any_password' });
		expect(result.success).toBe(true);
	});

	it('accepts any non-empty password (no min length restriction beyond 1)', () => {
		const result = v.safeParse(loginSchema, { username: 'hello', password: 'x' });
		expect(result.success).toBe(true);
	});

	it('rejects empty password', () => {
		const result = v.safeParse(loginSchema, { username: 'hello', password: '' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid username', () => {
		const result = v.safeParse(loginSchema, { username: 'ab', password: 'password' });
		expect(result.success).toBe(false);
	});
});

describe('flatten', () => {
	it('returns ok: true with parsed data on valid input', () => {
		const result = flatten(registerSchema, { username: 'hello', password: '123456' });
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toMatchObject({ username: 'hello', password: '123456' });
		}
	});

	it('returns ok: false with errors on invalid input', () => {
		const result = flatten(registerSchema, { username: 'ab', password: '123456' });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toHaveProperty('username');
			expect(typeof result.errors.username).toBe('string');
		}
	});

	it('returns first error per field when multiple validations fail', () => {
		// username: too short AND special chars — should get one error, not two
		const result = flatten(registerSchema, { username: 'a$', password: '12345' });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(typeof result.errors.username).toBe('string');
			expect(typeof result.errors.password).toBe('string');
		}
	});

	it('collects errors for multiple failing fields', () => {
		const result = flatten(registerSchema, { username: 'ab', password: '123' });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toHaveProperty('username');
			expect(result.errors).toHaveProperty('password');
		}
	});

	it('works with loginSchema', () => {
		const valid = flatten(loginSchema, { username: 'user_1', password: 'x' });
		expect(valid.ok).toBe(true);

		const invalid = flatten(loginSchema, { username: 'u', password: '' });
		expect(invalid.ok).toBe(false);
	});
});
