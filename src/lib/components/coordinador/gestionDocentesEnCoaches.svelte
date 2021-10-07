<script lang="ts">
	import { docentes } from '$lib/stores/db/docentes';

	import { docentesEnCoaches } from '$lib/stores/db/docentesEnCoaches';

	import type { DocenteComoUsuario } from '$lib/stores/lists/coachList';

	import { docentesList } from '$lib/stores/lists/docentesList';
	import type { DocentesEnCoaches } from '$lib/utils/interfaces';

	let filterFunction = (val) => val;
	let filterText: string;
	export let coachID;
	export let docentesSeleccionados: number[];
	export let docentesEnCoach: DocenteComoUsuario[] = [];
	let docentesIniciales = docentesSeleccionados;

	const handleFilter = () => {
		if (filterText) {
			filterFunction = (val) =>
				val.matricula.toString().includes(filterText);
			console.log(filterText);
		} else {
			filterFunction = (val) => val;
		}
	};

	const handleSubmit = () => {
		let doscentesNuevos = docentesSeleccionados.filter(
			(d) => !docentesIniciales.includes(d)
		);
		let docentesDesmarcados = docentesIniciales.filter(
			(d) => !docentesSeleccionados.includes(d)
		);
		console.log(docentesEnCoach);
		console.log('nuevos', doscentesNuevos);
		console.log('desmarcados', docentesDesmarcados);

		if (doscentesNuevos.length > 0) {
			for (let docenteID of doscentesNuevos) {
				docentesEnCoaches.addItem({
					id_coach: coachID,
					id_docente: Number(docenteID)
				});
			}
		}

		if (docentesDesmarcados.length > 0) {
			for (let docenteID of docentesDesmarcados) {
				docentesEnCoaches.removeItem(
					docentesEnCoach.find((v) => v.id_docente == docenteID)
						.id_docenteEnCoach
				);
			}
		}

		console.log(docentesEnCoach);

		docentesIniciales = docentesSeleccionados;
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	{#if $docentes.length == 0}
		<p>No hay docentes aún</p>
	{:else}
		<header class="flex justify-between">
			<h2 class="heading">Coach</h2>
			<button class="btn primary"> Asignar docentes a coach </button>
		</header>

		<div />

		<div class="ml-auto">
			<p class="label">Filtrar docentes por matricula</p>
			<input
				type="text"
				bind:value={filterText}
				on:input={handleFilter}
			/>
		</div>

		<p class="label">Selecciona docentes</p>
		<div class="flex flex-col gap-1 max-h-60 overflow-auto">
			{#each $docentesList.filter(filterFunction) as docente (docente.id)}
				<label class="flex gap-2 items-center">
					<input
						type="checkbox"
						value={docente.id_docente}
						bind:group={docentesSeleccionados}
					/>
					{docente.matricula} -
					{docente.nombre}
					{docente.apellido_paterno}
					{docente.apellido_materno}
				</label>
			{/each}
		</div>
	{/if}
</form>
