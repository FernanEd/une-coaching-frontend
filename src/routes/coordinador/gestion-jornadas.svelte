<script lang="ts">
	import GestionJornadas from '$lib/components/coordinador/gestionJornadas.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { cursos, cursosEnJornada, jornadas } from '$lib/stores/db';
	import { useModal } from '$lib/stores/modal';
	import {
		seleccionarJornada,
		store_jornadaSeleccionada
	} from '$lib/stores/selecionarJornada';
	import type { JornadaConCursos } from '$lib/stores/selecionarJornada';
	import type { Readable } from 'svelte/store';
	import { onMount } from 'svelte';
	import CursoJornadaForm from '$lib/components/coordinador/cursoJornadaForm.svelte';

	let filterText: string;
	const handleFilterField = () => {
		console.log(filterText);
	};

	let jornadaModal = useModal();
	let addCursoModal = useModal();
	let updateCursoModal = useModal();

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
		/>
	</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	{#if $currentJornada}
		<h2 class="heading">
			Jornada: {$currentJornada.titulo}
		</h2>
		<span class="flex gap-8 items-center">
			<button on:click={jornadaModal.openModal} class="link primary"
				>Gestionar jornadas</button
			>
			<button class="btn primary" on:click={addCursoModal.openModal}
				>Agregar curso
			</button>
		</span>
	{:else}
		<h2 class="heading">Jornadas</h2>
	{/if}
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
				<th>Instructor del curso</th>
				<th>Participantes</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="">
			{#each $currentJornada.cursos as cursoJornada (cursoJornada.id)}
				<tr>
					<td>{cursoJornada.curso.nombre}</td>
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
							Cupos restantes: <span class="font-bold"
								>{cursoJornada.cupo_maximo}</span
							>
						</p>

						{#if cursoJornada.asistentes.length == 0}
							<p class="text-text-4">
								No hay asistentes inscritos aun
							</p>
						{:else}
							<p>Inscritos:</p>
							{#each cursoJornada.asistentes as asistente (asistente.id)}
								<a href="#">{asistente.docente.matricula}</a>
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
