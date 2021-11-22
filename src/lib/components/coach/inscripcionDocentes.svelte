<script lang="ts">
	import { asistentesEnCurso } from '$lib/stores/db/asistentesEnCurso';

	import { docentesList } from '$lib/stores/lists/docentesList';
	import type { AsistenteDeCurso } from '$lib/stores/lists/selecionarJornada';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';

	let filterText: string;
	export let cursoJornadaID;
	export let docentesSeleccionados: number[] = [];
	export let asistenteEnCurso: AsistenteDeCurso[] = [];
	export let cupoCurso;
	let docentesIniciales = docentesSeleccionados;

	const handleSubmit = () => {
		let doscentesNuevos = docentesSeleccionados.filter(
			(d) => !docentesIniciales.includes(d)
		);
		let docentesDesmarcados = docentesIniciales.filter(
			(d) => !docentesSeleccionados.includes(d)
		);

		if (doscentesNuevos.length > 0) {
			for (let docenteID of doscentesNuevos) {
				asistentesEnCurso.addItem({
					id_docente: Number(docenteID),
					id_cursojornada: cursoJornadaID,
					aprobado: false,
					estado: 0
				});
			}
		}

		if (docentesDesmarcados.length > 0) {
			for (let docenteID of docentesDesmarcados) {
				asistentesEnCurso.removeItem(
					asistenteEnCurso.find((a) => a.id_docente == docenteID).id
				);
			}
		}

		docentesIniciales = docentesSeleccionados;
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	{#if $docentesList.length == 0}
		<p>No hay docentes aún</p>
	{:else}
		<header class="flex justify-between">
			<h2 class="heading">Inscribir a curso</h2>
			<button
				class="btn primary"
				class:hidden={docentesSeleccionados.length > cupoCurso}
			>
				Inscribir docentes
			</button>
		</header>

		<div class="ml-auto">
			<p class="label">Filtrar docentes</p>
			<input type="text" bind:value={filterText} />
		</div>

		{#if docentesSeleccionados.length > cupoCurso}
			<p class="text-status-danger">
				Por favor seleccione maximo {cupoCurso} docentes
			</p>
		{/if}

		<p class="label">Selecciona docentes</p>
		<div class="flex flex-col gap-1 max-h-60 overflow-auto">
			{#each makeArraySearchable($docentesList, ['matricula', 'nombre', 'apellido_paterno', 'apellido_materno'], filterText) as docente (docente.id)}
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
