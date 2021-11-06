<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { currentUser } from '$lib/stores/currentUser';
	import { usuarioList } from '$lib/stores/lists/usuariosList';
	import { userSession } from '$lib/stores/userSession';
	import { logOut } from '$lib/utils/auth';
	import { onMount } from 'svelte';
	import '../app.postcss';

	onMount(async () => {
		if (!$userSession.hasOwnProperty('userID')) {
			await goto(`/login?next=${$page.path}`);
		} else {
			if ($currentUser) {
				if (
					!$currentUser.roles.find(({ rol }) =>
						$page.path.includes(rol)
					)
				) {
					goto('/');
				}
			}
		}
	});
</script>

{#if $userSession.hasOwnProperty('userID')}
	{#if $currentUser}
		<slot />
	{:else}
		<h2>Parece que ocurrió un error con la sesión actual</h2>
		<button class="btn primary" on:click={logOut}
			>Volver a inicio</button
		>
	{/if}
{:else}
	<h2>Parece que ocurrió un error con la sesión actual</h2>
	<button class="btn primary" on:click={logOut}
		>Volver a inicio</button
	>
{/if}
