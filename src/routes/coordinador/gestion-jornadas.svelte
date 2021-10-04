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

	let filterText: string;
	let jornadaModal = useModal();
	let jornadaSeleccionada: number;

	onMount(() => {
		let unsubscribe = store_jornadaSeleccionada.subscribe((val) => {
			jornadaSeleccionada = val;
		});

		return unsubscribe;
	});

	let currentJornada: Readable<JornadaConCursos> | undefined;
	$: currentJornada = seleccionarJornada(jornadaSeleccionada);

	const handleFilterField = () => {
		console.log(filterText);
	};

	$: {
		console.log(jornadaSeleccionada, $currentJornada);
	}
</script>

{#if $jornadaModal}
	<Modal handleClose={jornadaModal.closeModal}
		><GestionJornadas /></Modal
	>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="text-2xl font-bold">
		{#if $currentJornada}
			Jornada: {$currentJornada.titulo}
		{:else}
			Jornadas
		{/if}
	</h2>
	<span class="flex gap-8 items-center">
		<button
			on:click={jornadaModal.openModal}
			class="font-bold text-accent">Gestionar jornadas</button
		>
		<button
			class="px-4 py-2 bg-accent 
  rounded-full shadow-xl 
  font-bold text-text-inv"
			>Agregar curso
		</button>
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
			{#each $currentJornada.cursos as curso (curso.id)}
				<tr>
					<td>Aplicación de tecnicas docente II</td>
					<td>Fernando Edmundo Balderas Morán</td>
					<td>
						<p>
							Cupos restantes: <span class="font-bold"
								>{(1 + Math.random() * 6) | 0}</span
							>
						</p>
						<p>Inscritos:</p>
						{#each [...Array((Math.random() * 20) | 0).fill('174819')] as s}
							<a href="#">{s}</a>,{' '}
						{/each}
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
