<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { userSession } from '$lib/stores/userSession';
	import { onMount } from 'svelte';
	import '../app.postcss';

	onMount(async () => {
		if (!$userSession) {
			await goto(`/login?next=${$page.path}`);
		} else {
			//If user doesnt has that role, throw him back
			if (
				!$userSession.userRoles.find((rol) =>
					$page.path.includes(rol)
				)
			) {
				await goto('/');
			}
		}
	});
</script>

{#if $userSession}
	<slot />
{/if}
