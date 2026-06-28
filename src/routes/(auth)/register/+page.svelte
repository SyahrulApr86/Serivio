<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { registerSchema, flatten } from '$lib/validation/auth';
	import { Button, Field, Input } from '$lib/components/ui';

	let username = $state('');
	let password = $state('');
	let errors = $state<Record<string, string>>({});
	let formError = $state('');
	let loading = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		formError = '';
		const parsed = flatten(registerSchema, { username, password });
		if (!parsed.ok) {
			errors = parsed.errors;
			return;
		}
		errors = {};
		loading = true;
		// PRD scope is username + password; synthesize an email Better Auth requires.
		const { error } = await authClient.signUp.email({
			name: username,
			username,
			email: `${username.toLowerCase()}@serivio.local`,
			password
		});
		loading = false;
		if (error) {
			formError = error.message ?? 'Could not create account';
			return;
		}
		goto('/dashboard');
	}
</script>

<svelte:head><title>Create account · Serivio</title></svelte:head>

<div class="rounded-[7px] border border-ash-border bg-paper-white p-8">
	<h1 class="text-[28px] font-medium tracking-tight text-midnight-ink">Create your account</h1>
	<p class="mt-1 font-sans text-[15px] text-carbon-nav">Start tracking in seconds.</p>

	<form onsubmit={submit} class="mt-6 flex flex-col gap-4">
		{#if formError}
			<div
				class="rounded-[7px] border border-prism-pink/40 bg-blush-wash px-3.5 py-2.5 font-sans text-[13px] text-prism-pink"
			>
				{formError}
			</div>
		{/if}

		<Field label="Username" error={errors.username} hint="Letters, numbers and underscore" required>
			<Input bind:value={username} autocomplete="username" placeholder="yourname" />
		</Field>
		<Field label="Password" error={errors.password} hint="At least 6 characters" required>
			<Input bind:value={password} type="password" autocomplete="new-password" placeholder="••••••••" />
		</Field>

		<Button type="submit" size="lg" disabled={loading} class="mt-2 w-full">
			{loading ? 'Creating…' : 'Create account'}
		</Button>
	</form>

	<p class="mt-6 text-center font-sans text-[14px] text-carbon-nav">
		Already have an account?
		<a href="/login" class="font-medium text-midnight-ink underline underline-offset-2">Sign in</a>
	</p>
</div>
