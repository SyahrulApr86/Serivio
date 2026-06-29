<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import { loginSchema, flatten } from '$lib/validation/auth';
	import { Button, Field, Input } from '$lib/components/ui';

	let username = $state('');
	let password = $state('');
	let errors = $state<Record<string, string>>({});
	let formError = $state('');
	let loading = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		formError = '';
		const parsed = flatten(loginSchema, { username, password });
		if (!parsed.ok) {
			errors = parsed.errors;
			return;
		}
		errors = {};
		loading = true;
		const { error } = await authClient.signIn.username({ username, password });
		loading = false;
		if (error) {
			formError = error.message ?? 'Invalid username or password';
			return;
		}
		const redirect = page.url.searchParams.get('redirect') ?? '/dashboard';
		goto(redirect);
	}
</script>

<svelte:head><title>Sign in · Serivio</title></svelte:head>

<div class="rounded-[7px] border border-ash-border bg-paper-white p-8">
	<h1 class="text-[28px] font-medium tracking-tight text-midnight-ink">Welcome back</h1>
	<p class="mt-1 font-sans text-[15px] text-carbon-nav">Sign in to continue your collection.</p>

	<form onsubmit={submit} class="mt-6 flex flex-col gap-4">
		{#if formError}
			<div
				class="rounded-[7px] border border-danger/30 bg-error-wash px-3.5 py-2.5 font-sans text-[13px] text-danger"
			>
				{formError}
			</div>
		{/if}

		<Field label="Username" error={errors.username} required>
			<Input bind:value={username} autocomplete="username" placeholder="demo" />
		</Field>
		<Field label="Password" error={errors.password} required>
			<Input bind:value={password} type="password" autocomplete="current-password" placeholder="••••••••" />
		</Field>

		<Button type="submit" size="lg" disabled={loading} class="mt-2 w-full">
			{loading ? 'Signing in…' : 'Sign in'}
		</Button>
	</form>

	<p class="mt-6 text-center font-sans text-[14px] text-carbon-nav">
		No account?
		<a href="/register" class="font-medium text-midnight-ink underline underline-offset-2"
			>Create one</a
		>
	</p>
</div>
