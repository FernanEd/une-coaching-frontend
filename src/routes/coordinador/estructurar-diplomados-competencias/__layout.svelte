<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<p class="label">Ver tabla</p>
<div class="flex gap-4">
	<a
		href="/coordinador/estructurar-diplomados-competencias/cursos"
		class="link"
		class:primary={$page.path ==
			'/coordinador/estructurar-diplomados-competencias/cursos'}>Cursos</a
	>
	/
	<a
		href="/coordinador/estructurar-diplomados-competencias/competencias"
		class="link"
		class:primary={$page.path ==
			'/coordinador/estructurar-diplomados-competencias/competencias'}
		>Competencias</a
	>
</div>

<slot />
