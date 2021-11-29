<script lang="ts">
	import { session } from '$app/stores';

	import Spinner from '$lib/components/common/spinner.svelte';
	import { db_usuarios } from '$lib/stores/db';
	import { toasts } from '$lib/stores/toasts';

	import { writable } from 'svelte/store';

	let loading = false;
	let errors = writable<string[]>([]);
	let passwordInput: string;

	const handleChange = async () => {
		loading = true;
		errors.set([]);

		try {
			await db_usuarios.updateItem($session.user.id, {
				password: passwordInput,
			});
			toasts.success();
		} catch (e) {
			toasts.error();
		} finally {
			loading = false;
		}
	};
</script>

<main
	class="absolute top-0 left-0 right-0 bottom-0
   flex flex-col justify-center items-center
   bg-une-red gap-8
   "
>
	<section class="w-40">
		<img
			class="object-contain"
			src="/static/une-white-logo.png"
			alt="Une logo"
			id="logo"
		/>
	</section>
	<h1 class="text-4xl font-bold text-white">Sistema coaching</h1>

	<form
		on:submit|preventDefault={handleChange}
		class="shadow-lg bg-white p-4 rounded-md flex flex-col max-w-sm w-screen gap-4"
	>
		<a href="/" class="link">Volver al menú principal</a>
		<header>
			<h2 class="heading">Cambiar contraseña</h2>
		</header>

		<div class="input-group">
			<p class="label">Nueva Contraseña</p>
			<input type="password" bind:value={passwordInput} required />
		</div>

		{#each $errors as error, i (i)}
			<p class="text-status-danger">
				{error}
			</p>
		{/each}

		<button class="btn primary flex justify-center items-center">
			{#if loading}
				<Spinner />
			{/if}
			Cambiar a nueva contraseña</button
		>
	</form>
	<div class="h-20" />
</main>
