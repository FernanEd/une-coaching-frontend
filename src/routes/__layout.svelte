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
	import { logIn, logOut } from '$lib/utils/auth';
	import type { JWT } from '$lib/utils/interfaces';
	import { serverURL } from '$lib/utils/serverURL';
	import { onMount, tick } from 'svelte';
	import '../app.postcss';

	const fail = async () => await goto(`/login?next=${$page.path}`);

	const checkUserPermission = () => {
		let next = $page.path;
		if (next != '/' && next != '/login' && next != '/newpassword') {
			let portal = $page.path.split('/')[1];
			if (!$currentUser.roles.map((r) => r.rol).includes(portal))
				return goto('/');
		}
	};

	onMount(async () => {
		if (!$loggedIn) {
			let jwt: JWT | undefined = JSON.parse(
				localStorage.getItem('jwt')
			);
			if (!jwt) return fail();

			try {
				let res = await fetch(`${serverURL}/token`, {
					headers: {
						Authorization: jwt.token
					}
				});

				if (res.status != 200) {
					return fail();
				}
				let auth = await res.json();

				loggedIn.set(true);
				logIn({
					userID: auth.userID,
					roles: auth.roles,
					token: auth.token
				});
				await tick();
				checkUserPermission();
			} catch (e) {
				console.error(e);
			}
		} else {
			await tick();
			checkUserPermission();
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
