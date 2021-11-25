<script lang="ts">
	import { goto } from '$app/navigation';

	import { session } from '$app/stores';

	import Spinner from '$lib/components/common/spinner.svelte';
	import { serverURL } from '$lib/constants/serverURL';
	let matriculaInput = '';
	let passwordInput = '';

	let loading = false;

	const handleLogin = async () => {
		console.log(matriculaInput, passwordInput);
		loading = true;

		try {
			const res = await fetch(`${serverURL}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				mode: 'cors',
				credentials: 'include',
				body: JSON.stringify({
					matricula: Number(matriculaInput),
					password: passwordInput,
				}),
			});

			if (res.status != 200) return;

			const data = await res.json();

			$session = {
				...data,
				isLoggedIn: true,
			};

			console.log(data);

			goto('/');
		} catch (e) {
			console.error(e);
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

		<button class="btn primary flex justify-center items-center">
			{#if loading}
				<Spinner />
			{/if}

			Ingresar</button
		>
	</form>
	<div class="h-20" />
</main>
