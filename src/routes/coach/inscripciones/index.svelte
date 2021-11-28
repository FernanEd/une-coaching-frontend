<script lang="ts">
	import Modal from '$lib/components/common/modal.svelte';
	import type { CursoEnJornadaConInvitaciones } from '$lib/stores/lists/jornada/cursosEnJornadaConInvitaciones';
	import { jornadaActual } from '$lib/stores/lists/jornada/jornadaActual';
	import { cursosParaInscribir } from '$lib/stores/lists/portal-coach/cursosParaInscribir';
	import { useModal } from '$lib/stores/useModal';
	import dayjs from 'dayjs';
	import InscribirDocentes from './_modules/inscribirDocentes.svelte';

	let inscribirModal = useModal();

	let currentCursoEnJornadaID: number | undefined;
	let currentCursoEnJornada: CursoEnJornadaConInvitaciones | undefined;
	$: currentCursoEnJornada = $cursosParaInscribir.find(
		(cJ) => cJ.id == currentCursoEnJornadaID
	);
</script>

{#if $inscribirModal}
	<button class="link mb-4" on:click={inscribirModal.closeModal}
		>← Volver atrás</button
	>
	<InscribirDocentes cursoEnJornada={currentCursoEnJornada} />
{/if}

{#if !$inscribirModal}
	{#if $jornadaActual}
		<h2 class="heading">
			{$jornadaActual.titulo}
		</h2>

		{#if dayjs(Date()).isAfter($jornadaActual.fecha_inscripcion_fin)}
			<p>El periodo de inscripciones ha terminado.</p>
		{:else if dayjs(Date()).isBefore($jornadaActual.fecha_inscripcion_inicio)}
			<p>El periodo de inscripciones aún no comienza.</p>
		{:else if $cursosParaInscribir.length == 0}
			<p>Aún no hay cursos en esta jornada.</p>
		{:else}
			<p class="label">Cursos de la jornada</p>
			<section class="flex flex-col gap-8 mt-4">
				{#each $cursosParaInscribir as cursoEnJornada (cursoEnJornada.id)}
					<article
						class="flex flex-col gap-4 rounded-2xl shadow-fix text-center p-4"
					>
						<div>
							<p class="label">
								{#if cursoEnJornada.curso.diplomado}
									{cursoEnJornada.curso.diplomado.nombre}
								{:else}
									Sin Diplomado
								{/if}
							</p>
							<p>{cursoEnJornada.curso.nombre}</p>
						</div>

						<div>
							<p class="label">Instructor</p>
							{#if cursoEnJornada.instructor}
								<p>
									{cursoEnJornada.instructor.nombre}
									{cursoEnJornada.instructor.apellido_paterno}
									{cursoEnJornada.instructor.apellido_materno}
								</p>
							{:else}
								<p class="text-text-4">Sin instructor asignado aún</p>
							{/if}
						</div>

						<div>
							<p class="label">
								Cupo: {cursoEnJornada.invitaciones.filter(
									(i) => i.estado_invitacion == 1
								).length} / {cursoEnJornada.cupo_maximo}
							</p>
							<p>{cursoEnJornada.invitaciones.length} invitaciones enviadas</p>
							<p class="text-status-danger">
								{cursoEnJornada.invitaciones.filter(
									(i) => i.estado_invitacion == 2
								).length} invitaciones rechazadas
							</p>
						</div>

						<button
							class="link primary"
							on:click={() => {
								currentCursoEnJornadaID = cursoEnJornada.id;
								inscribirModal.openModal();
							}}>Invitar docentes</button
						>
					</article>
				{/each}
			</section>
		{/if}
	{:else}
		No hay jornada activa.
	{/if}
{/if}
