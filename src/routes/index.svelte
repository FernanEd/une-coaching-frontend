<script lang="ts">
	import { goto } from '$app/navigation';
	import { usuarioList } from '$lib/stores/lists/usuariosList';
	import { userSession } from '$lib/stores/userSession';
	import { onMount, tick } from 'svelte';
	import { logOut } from '$lib/utils/auth';

	$: currentUser = $usuarioList.find(({ id }) => {
		if ($userSession) {
			if ($userSession.currentUser) {
				return id == $userSession.currentUser.id;
			}
		}

		return false;
	});
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

{#if currentUser}
	<section
		class="absolute top-0 left-0 right-0 bottom-0
	flex flex-col justify-center items-center
	bg-white gap-8
	"
	>
		<div class="w-full max-w-lg flex flex-col gap-8">
			<div>
				<p class="text-3xl font-bold text-text-1">
					Bienvenido {currentUser.nombre}
					{currentUser.apellido_paterno}
					{currentUser.apellido_materno}
				</p>
				<p>
					Este es el portal principal, aqui puedes acceder a tus
					roles.
				</p>
			</div>

			{#if currentUser.roles.length == 0}
				<div>
					<p class="text-text-4 font-bold">
						Oops! parece que no tienes roles asignados
					</p>
					<p>Comunicate con el coordinador del área</p>
				</div>
			{:else}
				<div>
					<p class="label">Selecciona un rol para ir a su portal</p>

					{#each currentUser.roles as role (role)}
						<p class="my-4">
							<a href={role.rol}
								>{role.rol[0].toUpperCase() + role.rol.substr(1)}</a
							>
						</p>
					{/each}
				</div>
			{/if}

			<button class="link primary self-start" on:click={logOut}
				>Cerrar sesión</button
			>
		</div>
	</section>
{/if}

<style>
</style>
