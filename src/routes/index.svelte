<script lang="ts">
	import { session } from '$app/stores';
	import Spinner from '$lib/components/common/spinner.svelte';
	import Sex from '$lib/components/sex.svelte';
	import { serverURL } from '$lib/constants/serverURL';

	const handleLogout = async () => {
		console.log('a');
		let res = await fetch(`${serverURL}/logout`, {
			credentials: 'include',
		});
		console.log('a');
		session.set({ isLoggedIn: false });
	};
</script>

<p>
	{$session};
</p>

{#if $session.isLoggedIn}
	<button on:click={handleLogout}>Logout</button>
	<h1 class="bg-red-300">Welcome to SvelteKit {$session.user.nombre}</h1>
	<p>
		Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
	</p>
	<Sex />
{:else}
	<Spinner />
{/if}
