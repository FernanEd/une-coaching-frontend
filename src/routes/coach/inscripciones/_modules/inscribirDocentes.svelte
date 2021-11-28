<script lang="ts">
	import { db_invitacionesCurso } from '$lib/stores/db';

	import type { DocenteComoUsuario } from '$lib/stores/lists/docentesComoUsuario';
	import type { CursoEnJornadaConInvitaciones } from '$lib/stores/lists/jornada/cursosEnJornadaConInvitaciones';
	import { getDocentesFaltantesDeCurso } from '$lib/stores/lists/portal-coach/getDocentesFaltantesDeCurso';
	import { toasts } from '$lib/stores/toasts';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';
	import type { CursoEnJornada } from '$lib/utils/types/db';
	import type { Readable } from 'svelte/store';

	export let cursoEnJornada: CursoEnJornadaConInvitaciones | undefined;
	let docentes: Readable<DocenteComoUsuario[] | undefined> | undefined;
	$: docentes = cursoEnJornada
		? getDocentesFaltantesDeCurso(cursoEnJornada.id)
		: undefined;

	export let docentesSeleccionados: number[] = [];
	// export let cupoCurso;
	// let docentesIniciales = docentesSeleccionados;

	let filterText: string;

	const handleSubmit = async () => {
		if (docentesSeleccionados.length > 0 && cursoEnJornada) {
			try {
				for (let docenteID of docentesSeleccionados) {
					await db_invitacionesCurso.addItem({
						id_docente: docenteID,
						id_cursojornada: cursoEnJornada.id,
						estado_invitacion: 0,
					});
				}

				toasts.success();
			} catch (e) {
				console.error(e);
				toasts.error();
			}
		}
	};
</script>

<h2 class="heading">Curso {cursoEnJornada?.curso.nombre}</h2>

<hr class="border-none my-2" />

<form on:submit|preventDefault={handleSubmit}>
	<span class="flex justify-between gap-8">
		<div>
			<p class="label">Busca un docente en particular</p>
			<input type="text" bind:value={filterText} />
		</div>

		<button class="btn primary flex-1" on:click={() => {}}
			>Invitar docentes
		</button>
	</span>

	<hr class="border-none my-4" />

	{#if docentes && $docentes}
		{#if $docentes.length == 0}
			<p class="text-text-4">No quedan docentes a quien invitar.</p>
		{:else}
			<p class="label mb-2">Selecciona docentes para invitarlos</p>
			<section class="flex flex-col gap-4">
				{#each makeArraySearchable($docentes, ['nombre', 'apellido_paterno', 'apellido_materno'], filterText) as docente (docente.id)}
					<label
						class="flex gap-2 items-center p-4 bg-neutral-100 border-2 rounded cursor-pointer select-none"
						class:border-accent={docentesSeleccionados.includes(
							docente.id_docente
						)}
					>
						<input
							class="hidden"
							type="checkbox"
							value={docente.id_docente}
							bind:group={docentesSeleccionados}
						/>
						{docente.nombre}
						{docente.apellido_paterno}
						{docente.apellido_materno}
					</label>
				{/each}
			</section>
		{/if}
	{/if}
</form>
