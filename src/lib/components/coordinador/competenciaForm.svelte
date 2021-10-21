<script lang="ts">
	import { competencias } from '$lib/stores/db/competencias';

	import { diplomados } from '$lib/stores/db/diplomados';
	import { tiposCompetencias } from '$lib/stores/db/tipoCompetencias';

	import { tick } from 'svelte';

	export let isEditing = false;
	export let diplomadoID: number = 0;

	export let nombreDiplomado = '';
	export let cursosSeleccionados: number[] = [];
	let cursosViejos: number[] = cursosSeleccionados;

	let selectedTipo: number;

	const handleSubmit = async () => {
		if (nombreDiplomado != '') {
			if (isEditing) {
				// let cursosDeseleccionados = cursosViejos.filter(
				// 	(cursoID) => !cursosSeleccionados.includes(cursoID)
				// );
				// let cursosActualizar = cursosSeleccionados.filter(
				// 	(cursoID) => !cursosViejos.includes(cursoID)
				// );
				// await diplomados.updateItem(diplomadoID, {
				// 	nombre: nombreDiplomado
				// });
				// for (let cursoID of cursosActualizar) {
				// 	await cursos.updateItem(cursoID, {
				// 		id_diplomado: diplomadoID
				// 	});
				// }
				// for (let cursoID of cursosDeseleccionados) {
				// 	await cursos.updateItem(cursoID, { id_diplomado: null });
				// }
				// //Actualizar cursos;
				// cursosViejos = cursosSeleccionados;
			} else {
				// let diplomado = await diplomados.addItem({
				// 	nombre: nombreDiplomado
				// });
				// let cursosDeDiplomado = cursosSeleccionados;
				// //Limpiar form;
				// cursosSeleccionados = [];
				// nombreDiplomado = '';
				// await Promise.all(
				// 	cursosDeDiplomado.map((cursoID) =>
				// 		cursos.updateItem(cursoID, { id_diplomado: diplomado.id })
				// 	)
				// );
				await competencias.addItem({
					nombre: nombreDiplomado,
					id_tipo: selectedTipo
				});
				tick();
				nombreDiplomado = '';
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
			<button class="btn primary">Agregar competencia</button>
		{/if}
	</header>

	<div>
		<p class="label">Nombre de la competencia</p>
		<input
			type="text"
			class="w-full"
			required
			bind:value={nombreDiplomado}
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
