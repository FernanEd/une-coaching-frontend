<script lang="ts">
	import InscripcionDocentes from '$lib/components/coach/inscripcionDocentes.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { currentJornada } from '$lib/stores/currentJornada';
	import { cursosEnJornada } from '$lib/stores/db/cursosEnJornada';
	import { diplomados } from '$lib/stores/db/diplomados';
	import { seleccionarJornada } from '$lib/stores/lists/selecionarJornada';
	import { useModal } from '$lib/stores/modal';
	import { derived } from 'svelte/store';

	$: jornada = seleccionarJornada($currentJornada?.id);

	let inscribirModal = useModal();
	let currentCursoEnJornadaID: number;

	$: currentCursoEnJornada = derived(jornada, ($jornada) => {
		if (!$jornada) return;

		return $jornada.cursos.find(
			(c) => c.id == currentCursoEnJornadaID
		);
	});
</script>

{#if $inscribirModal}
	<Modal handleClose={inscribirModal.closeModal}>
		<InscripcionDocentes
			cursoJornadaID={$currentCursoEnJornada.id}
			docentesSeleccionados={$currentCursoEnJornada.asistentes.map(
				(a) => a.id_docente
			)}
			asistenteEnCurso={$currentCursoEnJornada.asistentes}
		/>
	</Modal>
{/if}

{#if $jornada}
	<h2 class="heading">
		{$jornada.titulo}
	</h2>

	<section class="flex flex-col gap-8 mt-4">
		{#each $jornada.cursos as cursoEnJornada (cursoEnJornada.id)}
			<article
				class="flex flex-col gap-4 rounded-2xl shadow-fix text-center p-4"
			>
				<div>
					<p class="label">
						{$diplomados.find(
							(d) => d.id == cursoEnJornada?.curso?.id_diplomado
						)?.nombre}
					</p>
					<p>{cursoEnJornada?.curso?.nombre}</p>
				</div>

				<div>
					<p class="label">Instructor</p>
					<p>
						{cursoEnJornada.instructor.nombre}
						{cursoEnJornada.instructor.apellido_paterno}
						{cursoEnJornada.instructor.apellido_materno}
					</p>
				</div>

				<div>
					<p class="label">Cupo: {cursoEnJornada.cupo_maximo}</p>
					<p>
						{cursoEnJornada.cupo_maximo -
							cursoEnJornada.asistentes.length} restantes
					</p>
				</div>

				<button
					class="link primary"
					on:click={() => {
						currentCursoEnJornadaID = cursoEnJornada.id;
						inscribirModal.openModal();
					}}>Inscribir docentes</button
				>
			</article>
		{/each}
	</section>
{:else}
	No hay jornada activa
{/if}
