<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<p class="label">Ver tabla</p>
<div class="flex gap-4">
	<a
		href="/coordinador/gestion-diplomados-competencias/diplomados"
		class="link"
		class:primary={$page.path ==
			'/coordinador/gestion-diplomados-competencias/diplomados'}>Diplomados</a
	>
	<a
		href="/coordinador/gestion-diplomados-competencias/competencias"
		class="link"
		class:primary={$page.path ==
			'/coordinador/gestion-diplomados-competencias/competencias'}
		>Competencias</a
	>
</div>

<slot />
