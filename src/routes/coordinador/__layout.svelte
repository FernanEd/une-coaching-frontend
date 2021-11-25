<script lang="ts">
	import { page } from '$app/stores';

	import { currentUser } from '$lib/stores/currentUser';

	import { userSession } from '$lib/stores/userSession';
	import { logOut } from '$lib/utils/auth';
</script>

<aside
	class="bg-une-red fixed 
left-0 top-0 bottom-0 
py-8 px-4 flex flex-col 
gap-20"
>
	<section
		class="flex flex-col 
	gap-4 items-center 
	text-center"
	>
		<h1 class="text-white font-bold text-xl">Portal Coordinador</h1>
		<p class="text-gray-100">
			Conectado como {$currentUser.matricula}
		</p>
		<button class="font-bold text-accent-inv" on:click={logOut}
			>Cerrar sesión
		</button>
	</section>

	<section class="flex flex-col gap-8 mb-auto">
		<nav>
			<p class="leyenda text-gray-300 text-sm">Principal</p>
			<ul class="flex flex-col gap-4 font-bold">
				<li>
					<a class="text-white" href="/">Inicio</a>
				</li>
				<li>
					<a href="/newpassword" class="text-white">Cambiar contraseña</a>
				</li>
			</ul>
		</nav>

		<nav>
			<p class="leyenda text-gray-300 text-sm">PANELES</p>
			<ul class="flex flex-col gap-4 font-bold">
				<li>
					<a
						class="text-white"
						class:text-neutral-300={$page.path ==
							'/coordinador/gestion-usuarios'}
						href="/coordinador/gestion-usuarios">Gestionar usuarios</a
					>
				</li>
				<li>
					<a
						class="text-white"
						class:text-neutral-300={$page.path ==
							'/coordinador/gestion-jornadas'}
						href="/coordinador/gestion-jornadas">Gestionar jornadas</a
					>
				</li>
				<li>
					<a
						class="text-white"
						class:text-neutral-300={$page.path ==
							'/coordinador/coordinar-coaches'}
						href="/coordinador/coordinar-coaches">Coordinación de Coaches</a
					>
				</li>
				<li>
					<a
						class="text-white"
						class:text-neutral-300={$page.path ==
							'/coordinador/diplomados-competencias'}
						href="/coordinador/diplomados-competencias"
						>Diplomados y competencias</a
					>
				</li>
				<li>
					<a
						class="text-white"
						class:text-neutral-300={$page.path == '/coordinador/registros'}
						href="/coordinador/registros">Registros de acreditaciones</a
					>
				</li>
			</ul>
		</nav>
	</section>

	<section class="flex flex-col gap-4 items-center">
		<img
			class="object-contain"
			src="../../../static/une white logo.png"
			alt="Une logo"
			id="logo"
		/>
	</section>
</aside>
<main class="py-8 px-4">
	<slot />
</main>

<style>
	#logo {
		width: 100px;
	}

	aside {
		width: 250px;
	}
	main {
		margin-left: 250px;
	}
</style>
