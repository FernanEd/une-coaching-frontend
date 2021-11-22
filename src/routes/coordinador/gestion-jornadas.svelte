<script lang="ts">
	import GestionJornadas from '$lib/components/coordinador/gestionJornadas.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { useModal } from '$lib/stores/modal';
	import type { Readable } from 'svelte/store';
	import { onMount } from 'svelte';
	import CursoJornadaForm from '$lib/components/coordinador/cursoJornadaForm.svelte';
	import dayjs from 'dayjs';
	import { dateFormat } from '$lib/utils/dateFormat';
	import {
		AsistenteDeCurso,
		seleccionarJornada,
		store_jornadaSeleccionada
	} from '$lib/stores/lists/selecionarJornada';
	import type { JornadaConCursos } from '$lib/stores/lists/selecionarJornada';
	import { jornadas } from '$lib/stores/db/jornadas';
	import { cursosEnJornada } from '$lib/stores/db/cursosEnJornada';

	let jornadaModal = useModal();
	let addCursoModal = useModal();
	let updateCursoModal = useModal();
	let aprobados: AsistenteDeCurso[];
	let reprobados: AsistenteDeCurso[];

	let jornadaSeleccionada: number;
	onMount(() => {
		let unsubscribe = store_jornadaSeleccionada.subscribe((val) => {
			jornadaSeleccionada = val;
		});

		return unsubscribe;
	});

	let currentJornada: Readable<JornadaConCursos> | undefined;
	$: currentJornada = seleccionarJornada(jornadaSeleccionada);

	let currentCursoID: number;
	$: currentCurso = $cursosEnJornada.find(
		(c) => c.id == currentCursoID
	);
</script>

{#if $jornadaModal}
	<Modal handleClose={jornadaModal.closeModal}
		><GestionJornadas /></Modal
	>
{/if}

{#if $addCursoModal}
	<Modal handleClose={addCursoModal.closeModal}>
		<CursoJornadaForm currentjornadaID={$currentJornada.id} />
	</Modal>
{/if}

{#if $updateCursoModal}
	<Modal handleClose={updateCursoModal.closeModal}>
		<CursoJornadaForm
			currentjornadaID={$currentJornada.id}
			isEditing
			currentCursoID={currentCurso.id}
			cupoCurso={currentCurso.cupo_maximo}
			cursoSeleccionado={currentCurso.id_curso}
			instructorSeleccionado={currentCurso.id_instructor}
			cursoEstado={currentCurso.estado}
		/>
	</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="heading">
		{#if $currentJornada}
			Jornada: {$currentJornada.titulo}
		{:else}
			Jornadas
		{/if}
	</h2>
	<span class="flex gap-8 items-center">
		<button on:click={jornadaModal.openModal} class="link primary"
			>Gestionar jornadas</button
		>
		{#if $currentJornada}
			<button class="btn primary" on:click={addCursoModal.openModal}
				>Agregar curso
			</button>
		{/if}
	</span>
</header>

<hr class="my-4 border-none" />

<p class="label">Selecciona una jornada</p>
<select bind:value={$store_jornadaSeleccionada}>
	<option selected disabled value="">Sin seleccionar</option>
	{#each $jornadas as jornada (jornada.id)}
		<option value={jornada.id}>{jornada.titulo}</option>
	{/each}
</select>

<hr class="my-4 border-none" />

{#if $currentJornada}
	<span class="flex gap-8">
		<div>
			<p class="label">Periodo de la jornada</p>
			<p>
				{dayjs($currentJornada.fecha_inicio).format(dateFormat)} - {dayjs(
					$currentJornada.fecha_fin
				).format(dateFormat)}
			</p>
		</div>
		<div>
			<p class="label">Periodo de inscripciones</p>
			<p>
				{dayjs($currentJornada.fecha_inscripcion_inicio).format(
					dateFormat
				)} - {dayjs($currentJornada.fecha_inscripcion_fin).format(
					dateFormat
				)}
			</p>
		</div>
	</span>

	<hr class="my-4 border-none" />
{/if}

{#if !$currentJornada}
	<p>No hay jornada seleccionda aún</p>
{:else if $currentJornada.cursos.length == 0}
	<p class="text-text-4">
		No hay cursos en esta jornada aún, agrege uno.
	</p>
{:else}
	<table id="table" class="table-fixed table shadow-lg w-full">
		<thead>
			<tr>
				<th>Curso</th>
				<th>Estado</th>
				<th>Instructor del curso</th>
				<th>Participantes</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="">
			{#each $currentJornada.cursos as cursoJornada (cursoJornada.id)}
				<tr>
					<td>{cursoJornada.curso.nombre}</td>
					<td
						><p>
							{cursoJornada.estado == 0
								? 'En progreso'
								: cursoJornada.estado == 1
								? 'Cerrado'
								: '...'}
						</p>
						<br />
						{#if cursoJornada.estado == 1 && (aprobados = cursoJornada.asistentes.filter((a) => a.aprobado)) && (reprobados = cursoJornada.asistentes.filter((a) => !a.aprobado))}
							{#if aprobados.length == 0}
								<p class="text-text-3">No hay asistentes aprobados</p>
							{:else}
								<p class="text-status-success">
									Asistentes aprobados (con 7)
								</p>
								{#each aprobados as asistente (asistente.id)}
									<a href="#">{asistente.docente.matricula}</a><span
										>,
									</span>
								{/each}
							{/if}
							<br /><br />
							{#if reprobados.length == 0}
								<p class="text-text-3">
									No hay asistentes reprobados
								</p>
							{:else}
								<p class="text-status-danger">
									Asistentes reprobados
								</p>
								{#each reprobados as asistente (asistente.id)}
									<a href="#">{asistente.docente.matricula}</a><span
										>,
									</span>
								{/each}
							{/if}
						{/if}
					</td>
					<td>
						<a href="#">{cursoJornada.instructor.matricula}</a>
						<p>
							{cursoJornada.instructor.nombre}
							{cursoJornada.instructor.apellido_paterno}
							{cursoJornada.instructor.apellido_materno}
						</p>
					</td>
					<td>
						<p>
							Cupos asignados: <span class="font-bold">
								{cursoJornada.cupo_maximo}
							</span>
						</p>
						<p>
							Cupos restantes: <span class="font-bold"
								>{cursoJornada.cupo_maximo -
									cursoJornada.asistentes.length}</span
							>
						</p>

						{#if cursoJornada.asistentes.length == 0}
							<p class="text-text-4">
								No hay asistentes inscritos aun
							</p>
						{:else}
							<p>Inscritos:</p>
							{#each cursoJornada.asistentes as asistente (asistente.id)}
								<a href="#">{asistente.docente.matricula}</a><span
									>,
								</span>
							{/each}
						{/if}
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="font-bold text-accent"
								on:click={() => {
									currentCursoID = cursoJornada.id;
									updateCursoModal.openModal();
								}}>Editar curso</button
							>
							<button
								class="font-bold text-text-4"
								on:click={() =>
									cursosEnJornada.removeItem(cursoJornada.id)}
								>Eliminar curso</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
