<script lang="ts">
	import { currentUser } from '$lib/stores/currentUser';
	import { asistentesEnCurso } from '$lib/stores/db/asistentesEnCurso';
	import { getDocentePortal } from '$lib/stores/docentePortal';
	import { getInstructorPortal } from '$lib/stores/instructorPortal';
	import type { InstructorPortal } from '$lib/stores/instructorPortal';
	import type { Readable } from 'svelte/store';
	import { useModal } from '$lib/stores/modal';
	import PaginaAlumnos from '$lib/components/instructor/paginaAlumnos.svelte';
	import PaginaEstatusCurso from '$lib/components/instructor/paginaEstatusCurso.svelte';

	let paginaAlumnosModal = useModal();
	let paginaEstatusCursoModal = useModal();

	let currentCursoDeLaJornadaID: number;
	let instructor: Readable<InstructorPortal>;
	$: instructor = getInstructorPortal($currentUser?.id);

	$: currentCursoDeLaJornada = $instructor.cursos.find(
		(c) => c.id == currentCursoDeLaJornadaID
	);
</script>

{#if $paginaAlumnosModal}
	<PaginaAlumnos
		goBack={paginaAlumnosModal.closeModal}
		alumnos={currentCursoDeLaJornada.asistentes}
	/>
{/if}

{#if $paginaEstatusCursoModal}
	<PaginaEstatusCurso
		goBack={paginaEstatusCursoModal.closeModal}
		alumnos={currentCursoDeLaJornada.asistentes}
		cursoEnJornadaID={currentCursoDeLaJornada.id}
		isCompleted={currentCursoDeLaJornada.estado == 0 ? false : true}
	/>
{/if}

{#if !$paginaAlumnosModal && !$paginaEstatusCursoModal}
	{#if $instructor}
		<h2 class="heading">Cursos ({$instructor.cursos.length})</h2>

		{#if $instructor.cursos.length == 0}
			<p>No estas asignado a cursos esta jornada</p>
		{:else}
			<section class="flex flex-col gap-8 mt-4">
				{#each $instructor.cursos as cursoDeLaJornada (cursoDeLaJornada.id)}
					<article
						class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"
					>
						<p
							class="label"
							class:text-status-danger={cursoDeLaJornada?.estado == 1}
						>
							{cursoDeLaJornada?.estado == 0
								? 'En curso'
								: cursoDeLaJornada?.estado == 1
								? 'Cerrado'
								: '...'}
						</p>

						<div>
							<p class="label">
								{cursoDeLaJornada?.curso?.diplomado?.nombre}
							</p>
							<p>{cursoDeLaJornada?.curso?.nombre}</p>
						</div>

						<div>
							<p class="label">Alumnos</p>
							<p>
								{cursoDeLaJornada?.asistentes?.length} asistentes
							</p>
						</div>

						<div class="flex gap-8 justify-center">
							<button
								class="link primary"
								on:click={() => {
									currentCursoDeLaJornadaID = cursoDeLaJornada.id;
									paginaAlumnosModal.openModal();
								}}>Ver alumnos</button
							>
							<button
								class="link primary"
								on:click={() => {
									currentCursoDeLaJornadaID = cursoDeLaJornada.id;
									paginaEstatusCursoModal.openModal();
								}}>Gestionar curso</button
							>
						</div>
					</article>
				{/each}
			</section>
		{/if}
	{/if}
{/if}
