<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Prompt from '$lib/components/common/prompt.svelte';
	import Prompts from '$lib/components/common/prompt.svelte';
	import Toasts from '$lib/components/common/toasts.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { currentUser } from '$lib/stores/currentUser';
	import { usuarioList } from '$lib/stores/lists/usuariosList';
	import { loggedIn, userSession } from '$lib/stores/userSession';
	import { logOut } from '$lib/utils/auth';
	import { serverURL } from '$lib/utils/serverURL';
	import { onMount } from 'svelte';
	import '../app.postcss';

	const fail = async () => await goto(`/login?next=${$page.path}`);

	onMount(async () => {
		if (!$loggedIn) {
			let jwt = JSON.parse(localStorage.getItem('jwt'));
			if (!jwt) return fail();

			try {
				let ping = await fetch(`${serverURL}/token`, {
					headers: {
						Authorization: jwt
					}
				});

				if (ping.status != 200) {
					return fail();
				}

				console.log('weew lad');
				loggedIn.set(true);
				userSession.set(jwt);
			} catch (e) {
				return fail();
			}
		}
	});
</script>

{#if $currentUser}
	<slot />
{:else}
	<section
		class="absolute top-0 left-0 right-0 bottom-0
	flex flex-col justify-center items-center
	bg-white gap-8
	"
	>
		<h2>Parece que ocurrió un error con la sesión actual</h2>
		<button class="btn primary" on:click={logOut}
			>Volver a inicio</button
		>
	</section>
{/if}

<Toasts />

<Prompt />
