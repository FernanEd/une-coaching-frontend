<script lang="ts">
	import { goto } from '$app/navigation';
	import { page, session } from '$app/stores';
	import { userSession } from '$lib/stores/userSession';
	import type { JWT } from '$lib/utils/interfaces';
	import { beforeUpdate, onMount } from 'svelte';
	import '../app.postcss';

	onMount(async () => {
		if (!$userSession.currentUser) {
			let jwt: JWT | undefined = JSON.parse(
				localStorage.getItem('jwt')
			);

			if (!jwt) {
				await goto(`/login?next=${$page.path}`);
			} else {
				userSession.set(jwt);

				if (!jwt.userRoles.find((rol) => $page.path.includes(rol))) {
					await goto('/');
				}

				if (jwt.userRoles.length == 1) {
					await goto(jwt.userRoles[0]);
				}
			}
		}
	});

	beforeUpdate(async () => {
		if (!$userSession.currentUser) {
			await goto('/login');
		}
	});
</script>

{#if $userSession.currentUser}
	<slot />
{/if}
