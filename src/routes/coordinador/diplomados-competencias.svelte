<script lang="ts">
	import GestionCompetencias from '$lib/components/coordinador/gestionCompetencias.svelte';
	import GestionDiplomados from '$lib/components/coordinador/gestionDiplomados.svelte';

	let tab: 'diplomados' | 'competencias' = 'diplomados';
</script>

<p class="label">Ver tabla</p>
<div class="flex gap-4">
	<button
		on:click={() => (tab = 'diplomados')}
		class:primary={tab == 'diplomados'}
		class="link">Diplomados</button
	>
	/
	<button
		on:click={() => (tab = 'competencias')}
		class:primary={tab == 'competencias'}
		class="link">Competencias</button
	>
</div>

<hr class="my-4 border-none" />

{#if tab == 'diplomados'}
	<GestionDiplomados />
{:else}
	<GestionCompetencias />
{/if}
