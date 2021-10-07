<script lang="ts">
	import { currentSession } from '$lib/utils/auth';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

{#if $currentSession}
	<div>
		<p>
			Bienvenido {$currentSession.currentUser.nombre}

			{#each $currentSession.userRoles as role (role)}
				<p>
					<a href={role}>{role}</a>
				</p>
			{/each}
		</p>
	</div>
{/if}

<style>
</style>
