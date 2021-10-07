<script lang="ts">
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
		<p class="text-gray-300">
			Conectado como {$userSession.currentUser.matricula}
		</p>
		<button class="font-bold text-accent-inv" on:click={logOut}
			>Cerrar sesión
		</button>
	</section>

	<nav class="flex flex-col gap-2 mb-auto">
		<p class="leyenda text-gray-300 text-sm">PANELES</p>
		<ul class="flex flex-col gap-4 font-bold">
			<li>
				<a class="text-white" href="/coordinador/gestion-usuarios"
					>Gestionar usuarios</a
				>
			</li>
			<li>
				<a class="text-white" href="/coordinador/gestion-jornadas"
					>Gestionar jornadas</a
				>
			</li>
			<li>
				<a class="text-white" href="/coordinador/coordinar-coaches"
					>Coordinación de Coaches</a
				>
			</li>
			<li>
				<a
					class="text-white"
					href="/coordinador/diplomados-competencias"
					>Diplomados y competencias</a
				>
			</li>
			<li>
				<a class="text-white" href="/coordinador/registros"
					>Registros de acreditaciones</a
				>
			</li>
		</ul>
	</nav>

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
