<script lang="ts">
	import { session } from '$app/stores';
	import LogoutButton from '$lib/components/common/logoutButton.svelte';
	import { capitalizeString } from '$lib/utils/capitalizeString';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section
	class="absolute top-0 left-0 right-0 bottom-0
	flex flex-col justify-center items-center
	bg-white gap-8 p-4
	"
>
	<div class="w-full max-w-lg flex flex-col gap-8">
		<div>
			<p class="text-3xl font-bold text-text-1">
				Bienvenido {$session.user.nombre}
				{$session.user.apellido_paterno}
				{$session.user.apellido_materno}
			</p>
			<p>Este es el portal principal, aqui puedes acceder a tus roles.</p>
		</div>

		{#if $session.roles.length == 0}
			<div>
				<p class="text-text-4 font-bold">
					Oops! parece que no tienes roles asignados
				</p>
				<p>Comunicate con el coordinador del área</p>
			</div>
		{:else}
			<div>
				<p class="label">Selecciona un rol para ir a su portal</p>

				{#each $session.roles as role (role)}
					<p class="my-4">
						<a href={role}>{capitalizeString(role)}</a>
					</p>
				{/each}
			</div>
		{/if}

		<LogoutButton />
	</div>
</section>

<style>
</style>
