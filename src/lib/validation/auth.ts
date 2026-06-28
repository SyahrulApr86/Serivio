import * as v from 'valibot';

export const usernameSchema = v.pipe(
	v.string(),
	v.trim(),
	v.minLength(3, 'Username must be at least 3 characters'),
	v.maxLength(30, 'Username too long'),
	v.regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscore')
);

export const passwordSchema = v.pipe(
	v.string(),
	v.minLength(6, 'Password must be at least 6 characters'),
	v.maxLength(128, 'Password too long')
);

export const loginSchema = v.object({
	username: usernameSchema,
	password: v.pipe(v.string(), v.minLength(1, 'Password is required'))
});

export const registerSchema = v.object({
	username: usernameSchema,
	password: passwordSchema
});

export type LoginInput = v.InferOutput<typeof loginSchema>;
export type RegisterInput = v.InferOutput<typeof registerSchema>;

/** Returns first error per field, or null if valid. */
export function flatten<T extends v.GenericSchema>(
	schema: T,
	input: unknown
): { ok: true; data: v.InferOutput<T> } | { ok: false; errors: Record<string, string> } {
	const result = v.safeParse(schema, input);
	if (result.success) return { ok: true, data: result.output };
	const errors: Record<string, string> = {};
	for (const issue of result.issues) {
		const key = (issue.path?.[0]?.key as string) ?? '_';
		if (!errors[key]) errors[key] = issue.message;
	}
	return { ok: false, errors };
}
