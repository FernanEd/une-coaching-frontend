<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { currentUser } from '$lib/stores/currentUser';
	import { usuarioList } from '$lib/stores/lists/usuariosList';
	import { userSession } from '$lib/stores/userSession';
	import { onMount } from 'svelte';
	import '../app.postcss';

	onMount(async () => {
		if (!$userSession.hasOwnProperty('userID')) {
			await goto(`/login?next=${$page.path}`);
		} else {
			currentUser.subscribe((user) => {
				if (user) {
					if (
						!user.roles.find(({ rol }) => $page.path.includes(rol))
					) {
						goto('/');
					}
				}
			});
		}
	});
</script>

{#if $userSession.hasOwnProperty('userID') && $currentUser}
	<slot />
{/if}
