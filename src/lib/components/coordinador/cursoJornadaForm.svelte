<script lang="ts">
	import { cursos, diplomados } from '$lib/stores/db';

	import type { Curso } from '$lib/utils/interfaces';
	import { tick } from 'svelte';

	export let isEditing = false;
	export let diplomadoID: number = 0;

	export let nombreDiplomado = '';
	export let cursosSeleccionados: number[] = [];
	let cursosViejos: number[] = cursosSeleccionados;

	let filterText;
	let filterFunction: (val: any) => boolean = (val) => true;

	const handleSubmit = async () => {
		if (nombreDiplomado != '') {
			if (isEditing) {
				let cursosDeseleccionados = cursosViejos.filter(
					(cursoID) => !cursosSeleccionados.includes(cursoID)
				);
				let cursosActualizar = cursosSeleccionados.filter(
					(cursoID) => !cursosViejos.includes(cursoID)
				);
				await diplomados.updateItem(diplomadoID, {
					nombre: nombreDiplomado
				});
				for (let cursoID of cursosActualizar) {
					await cursos.updateItem(cursoID, {
						id_diplomado: diplomadoID
					});
				}
				for (let cursoID of cursosDeseleccionados) {
					await cursos.updateItem(cursoID, { id_diplomado: null });
				}
				//Actualizar cursos;
				cursosViejos = cursosSeleccionados;
			} else {
				let diplomado = await diplomados.addItem({
					nombre: nombreDiplomado
				});
				let cursosDeDiplomado = cursosSeleccionados;
				//Limpiar form;
				cursosSeleccionados = [];
				nombreDiplomado = '';
				await Promise.all(
					cursosDeDiplomado.map((cursoID) =>
						cursos.updateItem(cursoID, { id_diplomado: diplomado.id })
					)
				);
				tick();
			}
		}
	};

	const handleFilter = () => {
		if (filterText) {
			filterFunction = (val) => val.nombre.includes(filterText);
		} else {
			filterFunction = (val) => true;
		}
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	<header class="flex justify-between">
		<h2 class="heading">Curso</h2>
		{#if isEditing}
			<button class="btn primary">Editar diplomado</button>
		{:else}
			<button class="btn primary">Agregar diplomado</button>
		{/if}
	</header>

	<div>
		<p class="label">Nombre del diplomado</p>
		<input
			type="text"
			class="w-full"
			required
			bind:value={nombreDiplomado}
		/>
	</div>

	<div class="ml-auto">
		<p class="label">Filtrar cursos</p>
		<input
			type="text"
			bind:value={filterText}
			on:input={handleFilter}
		/>
	</div>

	<div>
		<p class="label">Agregar cursos</p>
		<div class="flex flex-col gap-1 max-h-60 overflow-auto">
			{#each $cursos.filter(filterFunction) as curso (curso.id)}
				<label class="flex gap-2 items-center">
					<input
						type="checkbox"
						bind:group={cursosSeleccionados}
						value={curso.id}
					/>
					{curso.nombre}
				</label>
			{/each}
		</div>
	</div>
</form>
