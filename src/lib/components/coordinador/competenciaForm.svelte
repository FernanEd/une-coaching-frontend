<script lang="ts">
	import { competencias } from '$lib/stores/db/competencias';

	import { diplomados } from '$lib/stores/db/diplomados';
	import { tiposCompetencias } from '$lib/stores/db/tipoCompetencias';

	import { tick } from 'svelte';

	export let isEditing = false;
	export let competenciaID: number = 0;
	export let nombreCompetencia = '';
	export let selectedTipo: number = undefined;

	const handleSubmit = async () => {
		if (nombreCompetencia != '') {
			if (isEditing) {
				await competencias.updateItem(competenciaID, {
					nombre: nombreCompetencia,
					id_tipo: selectedTipo
				});
				await tick();
			} else {
				await competencias.addItem({
					nombre: nombreCompetencia,
					id_tipo: selectedTipo
				});
				await tick();
				nombreCompetencia = '';
			}
		}
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	<header class="flex justify-between">
		<h2 class="heading">Competencias</h2>
		{#if isEditing}
			<button class="btn primary">Editar competencia</button>
		{:else}
			<button class="btn primary">Guardar competencia</button>
		{/if}
	</header>

	<div>
		<p class="label">Nombre de la competencia</p>
		<input
			type="text"
			class="w-full"
			required
			bind:value={nombreCompetencia}
		/>
	</div>

	<div>
		<p class="label">Agregar cursos</p>
		<select class="w-full" bind:value={selectedTipo}>
			{#each $tiposCompetencias as tipoCompetencia (tipoCompetencia.id)}
				<option value={tipoCompetencia.id}
					>{tipoCompetencia.nombre}</option
				>
			{/each}
		</select>
	</div>
</form>
