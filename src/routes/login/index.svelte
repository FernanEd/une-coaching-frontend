<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Spinner from '$lib/components/Spinner.svelte';
	import { currentUser } from '$lib/stores/currentUser';
	import { logIn } from '$lib/utils/auth';
	import type { JWT, Usuario } from '$lib/utils/interfaces';
	import { serverURL } from '$lib/utils/serverURL';
	import { writable } from 'svelte/store';

	type loginSuccess = {
		auth: true;
		userID: number;
		token: string;
		roles: string[];
	};

	type loginError = {
		auth: false;
		message: string;
	};

	let loading = false;
	let errors = writable<string[]>([]);
	let matriculaInput: number;
	let passwordInput: string;

	const handleLogin = async () => {
		loading = true;
		errors.set([]);
		try {
			let res = await fetch(`${serverURL}/login`, {
				method: 'POST',
				body: JSON.stringify({
					matricula: matriculaInput,
					password: passwordInput
				}),
				headers: {
					'Content-type': 'application/json'
				}
			});

			let login: loginSuccess | loginError = await res.json();

			if (login['auth'] == true) {
				matriculaInput = undefined;
				passwordInput = undefined;

				logIn({
					userID: login['userID'],
					token: login['token'],
					roles: login['roles']
				});

				let next = $page.query.get('next') || '/';

				if (next != '/') {
					let portal = next.split('/')[1];
					if (!$currentUser.roles.map((r) => r.rol).includes(portal))
						return goto('/');
				}

				return goto(next);
			} else {
				errors.set([login['message']]);
			}
		} catch (e) {
			errors.set(e);
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
			src="../../../static/une white logo.png"
			alt="Une logo"
			id="logo"
		/>
	</section>
	<h1 class="text-4xl font-bold text-white">Sistema coaching</h1>

	<form
		on:submit|preventDefault={handleLogin}
		class="shadow-lg bg-white p-4 rounded-md flex flex-col max-w-sm w-screen gap-4"
	>
		<header>
			<h2 class="heading">Iniciar sesión</h2>
		</header>

		<div class="input-group">
			<p class="label">Matricula</p>
			<input type="number" bind:value={matriculaInput} required />
		</div>
		<div class="input-group">
			<p class="label">Contraseña</p>
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

			Ingresar</button
		>
	</form>
	<div class="h-20" />
</main>
