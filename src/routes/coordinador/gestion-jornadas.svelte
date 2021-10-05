<script lang="ts">
	import GestionJornadas from '$lib/components/coordinador/gestionJornadas.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { cursos, jornadas } from '$lib/stores/db';
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
	let cursoModal = useModal();

	let jornadaSeleccionada: number;
	onMount(() => {
		let unsubscribe = store_jornadaSeleccionada.subscribe((val) => {
			jornadaSeleccionada = val;
		});

		return unsubscribe;
	});

	let currentJornada: Readable<JornadaConCursos> | undefined;
	$: currentJornada = seleccionarJornada(jornadaSeleccionada);
</script>

{#if $jornadaModal}
	<Modal handleClose={jornadaModal.closeModal}
		><GestionJornadas /></Modal
	>
{/if}

{#if $cursoModal}
	<Modal handleClose={cursoModal.closeModal}>
		<CursoJornadaForm currentjornadaID={$currentJornada.id} />
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
			<button class="btn primary" on:click={cursoModal.openModal}
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
							<button class="font-bold text-accent"
								>Editar curso</button
							>
							<button class="font-bold text-text-4"
								>Eliminar curso</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
