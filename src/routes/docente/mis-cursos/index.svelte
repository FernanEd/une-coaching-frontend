<script lang="ts">
	import { session } from '$app/stores';
	import { docentesComoUsuarios } from '$lib/stores/lists/docentesComoUsuario';
	import { jornadaActual } from '$lib/stores/lists/jornada/jornadaActual';
	import {
		CursoEnJornadaConCalificacion,
		getCursosParaDocente,
	} from '$lib/stores/lists/portal-docente/getCursosParaDocente';
	import {
		getInvitacionesParaDocente,
		InvitacionCursoConInstructorConCurso,
	} from '$lib/stores/lists/portal-docente/getInvitacionesParaDocente';
	import type { Readable } from 'svelte/store';
	import Invitaciones from './_modules/invitaciones.svelte';

	let docenteID: number | undefined;
	$: docenteID = $docentesComoUsuarios.find(
		(d) => d.id == $session.user.id
	)?.id_docente;

	let invitaciones:
		| Readable<InvitacionCursoConInstructorConCurso[]>
		| undefined;
	$: invitaciones = docenteID
		? getInvitacionesParaDocente(docenteID)
		: undefined;

	let cursosJornada: Readable<CursoEnJornadaConCalificacion[]> | undefined;
	$: cursosJornada = docenteID ? getCursosParaDocente(docenteID) : undefined;
</script>

{#if invitaciones && $invitaciones}
	{#if $invitaciones.length > 0}
		<Invitaciones {docenteID} invitaciones={$invitaciones} />
		<hr class="border my-12" />
	{/if}
{/if}

{#if cursosJornada && $cursosJornada}
	<h2 class="heading">Cursos ({$cursosJornada.length})</h2>
	{#if $jornadaActual}
		<p class="label">De la jornada {$jornadaActual.titulo}</p>
	{/if}

	<hr class="my-2 border-none" />

	{#if $cursosJornada.length == 0}
		<p>No estas inscrito a cursos en esta jornada aún.</p>
	{:else}
		<section class="flex flex-col gap-8 mt-4">
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
								<p>{cursoJornada.curso.diplomado.nombre}</p>
							{:else}
								<p>Sin diplomado</p>
							{/if}
						</p>
						<p>{cursoJornada.curso.nombre}</p>
					</div>

					<div>
						<p class="label">Instructor</p>
						{#if cursoJornada.instructor}
							<p>
								{cursoJornada.instructor.nombre}
								{cursoJornada.instructor.apellido_paterno}
								{cursoJornada.instructor.apellido_materno}
							</p>
						{:else}
							<p>Sin instructor asignado aún</p>
						{/if}
					</div>

					{#if cursoJornada.estado == 1}
						<div>
							<p class="label">Calificación</p>
							<p
								class="font-bold"
								class:text-status-success={cursoJornada.aprobado}
								class:text-status-danger={!cursoJornada.aprobado}
							>
								{cursoJornada.aprobado ? 'Aprobado' : 'Reprobado'}
							</p>
						</div>
					{/if}
				</article>
			{/each}
		</section>
	{/if}
{/if}
