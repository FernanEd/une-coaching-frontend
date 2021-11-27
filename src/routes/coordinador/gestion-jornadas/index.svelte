<script lang="ts">
	import Modal from '$lib/components/common/modal.svelte';

	import {
		db_cursos,
		db_cursosEnJornada,
		db_instructores,
		db_jornadas,
	} from '$lib/stores/db';

	import { cursosEnJornadaConInstructorConCurso } from '$lib/stores/lists/jornada/cursosEnJornadaConInstructorConCurso';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toasts';
	import { useModal } from '$lib/stores/useModal';
	import { formatDate } from '$lib/utils/formatDate';
	import type { CursoEnJornada, Jornada } from '$lib/utils/types/db';
	import CompetenciaForm from '../estructurar-diplomados-competencias/competencias/_modules/competenciaForm.svelte';
	import CursoJornadaForm from './_modules/cursoJornadaForm.svelte';
	import GestionJornadas from './_modules/gestionJornadas.svelte';
	import { jornadaSeleccionada } from './_modules/jornadaSeleccionada';

	let currentJornadaID: number | undefined;
	$: currentJornadaID = $jornadaSeleccionada;
	let currentJornada: Jornada | undefined;
	$: currentJornada = $db_jornadas.find((j) => j.id == currentJornadaID);

	let currentCursoEnJornadaID: number | undefined;
	let currentCursoEnJornada: CursoEnJornada | undefined;
	$: currentCursoEnJornada = $db_cursosEnJornada.find(
		(cJ) => cJ.id == currentCursoEnJornadaID
	);

	let gestionJornadasModal = useModal();
	let agregarCursoJornadaModal = useModal();
	let editarCursoJornadaModal = useModal();
</script>

{#if $gestionJornadasModal}
	<Modal handleClose={gestionJornadasModal.closeModal}
		><GestionJornadas /></Modal
	>
{/if}

{#if $agregarCursoJornadaModal}
	<Modal handleClose={agregarCursoJornadaModal.closeModal}>
		<CursoJornadaForm jornadaPertenecienteID={currentJornada?.id} />
	</Modal>
{/if}

{#if $editarCursoJornadaModal}
	<Modal handleClose={editarCursoJornadaModal.closeModal}>
		<CursoJornadaForm
			jornadaPertenecienteID={currentJornada?.id}
			instructorSeleccionado={currentCursoEnJornada?.id_instructor}
			editingCursoJornada={currentCursoEnJornada}
			estadoDelCurso={currentCursoEnJornada?.estado}
			form={{
				cupo_maximo: currentCursoEnJornada?.cupo_maximo,
				id_curso: currentCursoEnJornada?.id_curso,
			}}
		/>
	</Modal>
{/if}

<!-- {#if $asistentesModal}
	<Modal handleClose={asistentesModal.closeModal}>
		<ListaAsistentes asistentes={listaAsistentes} />
	</Modal>
{/if} -->

<header class="flex justify-between flex-wrap">
	<h2 class="heading">
		{#if currentJornada}
			Jornada: {currentJornada.titulo}
		{:else}
			Jornadas
		{/if}
	</h2>
	<span class="flex gap-8 items-center">
		<button on:click={gestionJornadasModal.openModal} class="link primary"
			>Gestionar jornadas</button
		>
		{#if currentJornada}
			<button class="btn primary" on:click={agregarCursoJornadaModal.openModal}
				>Agregar curso
			</button>
		{/if}
	</span>
</header>

<hr class="my-4 border-none" />

<p class="label">Selecciona una jornada</p>
<select bind:value={$jornadaSeleccionada}>
	<option value={undefined} disabled>Sin seleccionar</option>
	{#each $db_jornadas as jornada (jornada.id)}
		<option value={jornada.id}>{jornada.titulo}</option>
	{/each}
</select>

<hr class="my-4 border-none" />

{#if currentJornada}
	<span class="flex gap-8">
		<div>
			<p class="label">Periodo de la jornada</p>
			<p>
				{formatDate(currentJornada.fecha_inicio, true)} - {formatDate(
					currentJornada.fecha_fin,
					true
				)}
			</p>
		</div>
		<div>
			<p class="label">Periodo de inscripciones</p>
			<p>
				{formatDate(currentJornada.fecha_inscripcion_inicio, true)} - {formatDate(
					currentJornada.fecha_inscripcion_fin,
					true
				)}
			</p>
		</div>
	</span>

	<hr class="my-4 border-none" />
{/if}

{#if !currentJornada}
	<p>No hay jornada seleccionada aún</p>
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
			{#each $cursosEnJornadaConInstructorConCurso.filter((cJ) => cJ.id_jornada == currentJornadaID) as cursoJornada (cursoJornada.id)}
				<tr>
					<td>{cursoJornada.curso.nombre}</td>
					<td
						><p class:text-status-danger={cursoJornada.estado == 1}>
							{cursoJornada.estado == 0
								? 'En progreso'
								: cursoJornada.estado == 1
								? 'Cerrado'
								: '...'}
						</p>
					</td>
					<td>
						{#if cursoJornada.instructor}
							<p>
								{cursoJornada.instructor.nombre}
								{cursoJornada.instructor.apellido_paterno}
								{cursoJornada.instructor.apellido_materno}
							</p>
						{:else}
							<p class="text-text-4">Sin instructor asignado aún</p>
						{/if}
					</td>
					<td>
						<p>{cursoJornada.cupo_maximo}</p>
						<!-- <p>
						Inscritos: {cursoJornada.asistentes
							.length}/{cursoJornada.cupo_maximo}
					</p>
					<p>
						<button
							class="link primary"
							on:click={() => {
								asistentesModal.openModal();
								listaAsistentes = cursoJornada.asistentes;
							}}>Ver asistentes</button
						>
					</p> -->
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="font-bold text-accent"
								on:click={() => {
									currentCursoEnJornadaID = cursoJornada.id;
									editarCursoJornadaModal.openModal();
								}}>Editar curso</button
							>
							<button
								class="font-bold text-text-4"
								on:click={() =>
									prompts.showPrompt({
										type: 'danger',
										message:
											'¿Estás seguro que quieres borrar este curso? Si la borras todos los registros creados de este curso se perderán.',
										onAccept: async () => {
											try {
												await db_cursosEnJornada.deleteItem(cursoJornada.id);
												toasts.success();
											} catch (e) {
												toasts.error();
											}
										},
									})}>Eliminar curso</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
