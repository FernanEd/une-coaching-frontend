<script lang="ts">
	import { session } from '$app/stores';
	import { instructoresComoUsuario } from '$lib/stores/lists/instructoresComoUsuario';
	import type { CursoEnJornadaConAsistentes } from '$lib/stores/lists/jornada/cursosEnJornadaConAsistentes';
	import { jornadaActual } from '$lib/stores/lists/jornada/jornadaActual';
	import { getCursosParaInstructor } from '$lib/stores/lists/portal-instructor/getCursosParaInstructor';

	import { useModal } from '$lib/stores/useModal';
	import type { Readable } from 'svelte/store';
	import CalificarAlumnos from './_modules/calificarAlumnos.svelte';
	import EstatusCurso from './_modules/estatusCurso.svelte';

	let cursosJornada: Readable<CursoEnJornadaConAsistentes[]> | undefined;
	let instructorID: number | undefined;
	$: instructorID = $instructoresComoUsuario.find(
		(i) => i.id == $session.user.id
	)?.id_instructor;

	$: cursosJornada = instructorID
		? getCursosParaInstructor(instructorID)
		: undefined;

	let calificarAlumnosModal = useModal();
	let estatusCursoModal = useModal();

	let selectedCursoJornadaID: number | undefined;
	let selectedCursoJornada: CursoEnJornadaConAsistentes | undefined;
	$: selectedCursoJornada = cursosJornada
		? $cursosJornada.find((c) => c.id == selectedCursoJornadaID)
		: undefined;
</script>

{#if $calificarAlumnosModal}
	<button class="link mb-4" on:click={calificarAlumnosModal.closeModal}
		>← Volver atrás</button
	>
	<CalificarAlumnos />
{/if}

{#if $estatusCursoModal}
	<button class="link mb-4" on:click={estatusCursoModal.closeModal}
		>← Volver atrás</button
	>
	<EstatusCurso
		cursoEnJornadaID={selectedCursoJornada?.id}
		alumnos={selectedCursoJornada?.asistentes}
		isCompleted={selectedCursoJornada?.estado == 0
			? false
			: selectedCursoJornada?.estado == 1
			? true
			: false}
	/>
{/if}

{#if cursosJornada && !$calificarAlumnosModal && !$estatusCursoModal}
	<h2 class="heading">Cursos ({$cursosJornada.length})</h2>
	<p class="label">De la jornada {$jornadaActual.titulo}</p>

	<hr class="my-2 border-none" />

	{#if $cursosJornada.length == 0}
		<p>No tiene cursos en esta jornada aún.</p>
	{:else}
		<section class="flex flex-col gap-8">
			{#each $cursosJornada as cursoJornada (cursoJornada.id)}
				<article
					class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"
				>
					<p class="label" class:text-status-danger={cursoJornada.estado == 1}>
						{cursoJornada.estado == 0
							? 'En curso'
							: cursoJornada.estado == 1
							? 'Cerrado'
							: '...'}
					</p>

					<div>
						<p class="label">
							{#if cursoJornada.curso.diplomado}
								{cursoJornada.curso.diplomado.nombre}
							{:else}
								Sin diplomado
							{/if}
						</p>
						<p>{cursoJornada.curso.nombre}</p>
					</div>

					<div>
						<p class="label">Alumnos</p>
						<p>
							{cursoJornada.asistentes.length} asistentes
						</p>
					</div>

					<div class="flex gap-8 justify-center">
						<button
							class="link primary"
							on:click={() => {
								selectedCursoJornadaID = cursoJornada.id;
								calificarAlumnosModal.openModal();
							}}>Calificar alumnos</button
						>
						<button
							class="link primary"
							on:click={() => {
								selectedCursoJornadaID = cursoJornada.id;
								estatusCursoModal.openModal();
							}}>Gestionar curso</button
						>
					</div>
				</article>
			{/each}
		</section>
	{/if}
{/if}
