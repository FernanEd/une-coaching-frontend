<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Prompt from '$lib/components/common/prompt.svelte';
	import Prompts from '$lib/components/common/prompt.svelte';
	import Toasts from '$lib/components/common/toasts.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
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
