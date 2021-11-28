<script lang="ts">
	import { db_docentesEnCoaches } from '$lib/stores/db';
	import type { DocenteComoUsuarioEnCoach } from '$lib/stores/lists/coachesConDocentes';
	import { docentesComoUsuarios } from '$lib/stores/lists/docentesComoUsuario';
	import { toasts } from '$lib/stores/toasts';
	import { handleError } from '$lib/utils/handleError';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';

	let filterText: string;

	export let coachID: number | undefined;
	export let coachUserID: number | undefined;
	export let docentesSeleccionados: number[] = [];
	export let docentesEnCoach: DocenteComoUsuarioEnCoach[] = [];
	let docentesIniciales = docentesSeleccionados;

	const handleSubmit = async () => {
		let doscentesNuevos = docentesSeleccionados.filter(
			(d) => !docentesIniciales.includes(d)
		);
		let docentesDesmarcados = docentesIniciales.filter(
			(d) => !docentesSeleccionados.includes(d)
		);

		try {
			if (doscentesNuevos.length > 0) {
				for (let docenteID of doscentesNuevos) {
					if (coachID) {
						await db_docentesEnCoaches.addItem({
							id_coach: coachID,
							id_docente: Number(docenteID),
						});
					}
				}
			}

			if (docentesDesmarcados.length > 0) {
				for (let docenteID of docentesDesmarcados) {
					let docenteEnCoach = docentesEnCoach.find(
						(v) => v.id_docente == docenteID
					);
					if (docenteEnCoach)
						await db_docentesEnCoaches.deleteItem(
							docenteEnCoach.id_docenteEnCoach
						);
				}
			}

			toasts.success();
		} catch (e) {
			handleError(e);
		}

		docentesIniciales = docentesSeleccionados;
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	{#if $docentesComoUsuarios.length == 0}
		<p>No hay docentes aún</p>
	{:else}
		<header class="flex justify-between">
			<h2 class="heading">Coach</h2>
			<button class="btn primary"> Asignar docentes a coach </button>
		</header>

		<div>
			<p class="label">Filtrar docentes</p>
			<input type="text" bind:value={filterText} />
		</div>

		<p class="label">Selecciona docentes</p>
		<div class="flex flex-col gap-1 max-h-60 overflow-auto">
			{#each makeArraySearchable( $docentesComoUsuarios.filter((d) => d.id != coachUserID), ['nombre', 'apellido_paterno', 'apellido_materno'], filterText ) as docente (docente.id)}
				<label class="flex gap-2 items-center">
					<input
						type="checkbox"
						value={docente.id_docente}
						bind:group={docentesSeleccionados}
					/>
					{docente.nombre}
					{docente.apellido_paterno}
					{docente.apellido_materno}
				</label>
			{/each}
		</div>
	{/if}
</form>
