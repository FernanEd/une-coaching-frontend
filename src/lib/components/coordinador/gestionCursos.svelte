<script lang="ts">
	import { cursos } from '$lib/stores/db/cursos';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toastlist';

	import type { Curso } from '$lib/utils/interfaces';
	import { onMount } from 'svelte';

	let cursoName;
	let currentID;

	const handleSubmit = async () => {
		if (cursoName) {
			if (currentID) {
				try {
					await cursos.updateItem(currentID, { nombre: cursoName });
					currentID = undefined;

					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
			} else {
				try {
					await cursos.addItem({
						nombre: cursoName,
						id_diplomado: null
					});

					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
			}
			cursoName = '';
		}
	};

	const handleUpdate = (curso: Curso) => {
		currentID = curso.id;
		cursoName = curso.nombre;
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col gap-4 w-screen max-w-xl"
>
	<header class="flex justify-between flex-wrap">
		<h2 class="heading">Cursos</h2>
		{#if currentID}
			<button class="btn primary">Editar curso </button>
		{:else}
			<button class="btn primary">Agregar curso </button>
		{/if}
	</header>

	<label class="w-full">
		<p class="label">Nombre del curso</p>
		<input
			type="text"
			class="w-full"
			bind:value={cursoName}
			required
		/>
	</label>
</form>

<hr class="my-4 border-none" />

{#if $cursos.length == 0}
	<p>No hay cursos aún.</p>
{:else}
	<table class="table-fixed table shadow-lg max-w-xl w-full">
		<thead>
			<tr>
				<th>Curso</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="max-h-60 overflow-auto">
			{#each $cursos as curso (curso.id)}
				<tr>
					<td>{curso.nombre}</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="font-bold text-accent"
								on:click={() => handleUpdate(curso)}
								>Editar curso</button
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
												await cursos.removeItem(curso.id);
												toasts.success();
											} catch (e) {
												console.error(e);
												toasts.error();
											}
										}
									})}>Eliminar curso</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
