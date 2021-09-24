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
		<p class="text-gray-300">Conectado como 170000</p>
		<button class="bg-white text-text-1 rounded-full shadow-lg py-2 px-4">Cerrar sesión</button>
	</section>

	<nav class="flex flex-col gap-2 mb-auto">
		<p class="leyenda text-gray-300 text-sm">PANELES</p>
		<ul class="flex flex-col gap-4 font-bold">
			<li><a class="text-white" href="gestion-usuarios">Gestionar usuarios</a></li>
			<li><a class="text-white" href="gestion-jornadas">Gestionar jornadas</a></li>
			<li><a class="text-white" href="coordinar-coaches">Coordinación de Coaches</a></li>
			<li><a class="text-white" href="diplomados-competencias">Diplomados y competencias</a></li>
			<li><a class="text-white" href="registros">Archivos y registros</a></li>
		</ul>
	</nav>

	<section class="flex flex-col gap-4 items-center">
		<img class="object-contain" src="../../../static/une white logo.png" alt="Une logo" id="logo" />
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
