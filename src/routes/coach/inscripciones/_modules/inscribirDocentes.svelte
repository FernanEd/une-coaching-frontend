<script lang="ts">
	import type { DocenteComoUsuario } from '$lib/stores/lists/docentesComoUsuario';

	import { getDocentesFaltantesDeCurso } from '$lib/stores/lists/portal-coach/getDocentesFaltantesDeCurso';

	import type { Curso } from '$lib/utils/types/db';
	import type { Readable } from 'svelte/store';

	export let curso: Curso | undefined;
	let docentes: Readable<DocenteComoUsuario[]> | undefined;
	$: docentes = curso ? getDocentesFaltantesDeCurso(curso?.id) : undefined;

	export let docentesSeleccionados: number[] = [];
	// export let cupoCurso;
	// let docentesIniciales = docentesSeleccionados;

	let filterText: string;
</script>

<h2 class="heading">Curso {curso?.nombre}</h2>

<hr class="border-none my-2" />

<form action="">
	<button class="btn primary" on:click={() => {}}>Invitar docentes </button>

	<hr class="border-none my-4" />

	{#if docentes}
		{#if $docentes.length == 0}
			<p class="text-text-4">
				Al parecer todos los docentes ya han completado este curso.
			</p>
		{:else}
			<p class="label mb-2">Selecciona docentes para invitarlos</p>
			<section class="flex flex-col gap-4">
				{#each $docentes as docente (docente.id)}
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
