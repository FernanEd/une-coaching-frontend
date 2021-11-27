<script lang="ts">
	import { page, session } from '$app/stores';
	import LogoutButton from '$lib/components/common/logoutButton.svelte';
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
			Conectado como {$session.user.nombre}
			{$session.user.apellido_paterno}
			{$session.user.apellido_materno}
		</p>
		<LogoutButton />
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
						class:text-neutral-300={$page.path.includes(
							'/coordinador/gestion-usuarios'
						)}
						href="/coordinador/gestion-usuarios">Gestionar usuarios</a
					>
				</li>
				<li>
					<a
						class="text-white"
						class:text-neutral-300={$page.path.includes(
							'/coordinador/gestion-jornadas'
						)}
						href="/coordinador/gestion-jornadas">Gestionar Jornadas</a
					>
				</li>
				<li>
					<a
						class="text-white"
						class:text-neutral-300={$page.path.includes(
							'/coordinador/coordinar-coaches'
						)}
						href="/coordinador/coordinar-coaches">Coordinación de Coaches</a
					>
				</li>
				<li>
					<a
						class="text-white"
						class:text-neutral-300={$page.path.includes(
							'/coordinador/estructurar-diplomados-competencias'
						)}
						href="/coordinador/estructurar-diplomados-competencias"
						>Estructurar Diplomados, Cursos y Competencias</a
					>
				</li>
				<li>
					<a
						class="text-white"
						class:text-neutral-300={$page.path.includes(
							'/coordinador/gestion-registros'
						)}
						href="/coordinador/gestion-registros">Registros de acreditaciones</a
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

<svelte:head>UNE Coaching</svelte:head>

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
