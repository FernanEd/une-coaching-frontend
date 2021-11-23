<script lang="ts">
	import { cursos } from '$lib/stores/db/cursos';
	import { tiposCompetencias } from '$lib/stores/db/tipoCompetencias';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toastlist';
	import type { TipoCompetencia } from '$lib/utils/interfaces';

	let tipoCompetenciaName;
	let currentID;

	const handleSubmit = async () => {
		if (tipoCompetenciaName) {
			if (currentID) {
				try {
					await tiposCompetencias.updateItem(currentID, {
						nombre: tipoCompetenciaName
					});
					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}

				currentID = undefined;
			} else {
				try {
					await tiposCompetencias.addItem({
						nombre: tipoCompetenciaName
					});
					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
			}
			tipoCompetenciaName = '';
		}
	};

	const handleUpdate = (tipoCompetencia: TipoCompetencia) => {
		currentID = tipoCompetencia.id;
		tipoCompetenciaName = tipoCompetencia.nombre;
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col gap-4 w-screen max-w-xl"
>
	<header class="flex justify-between flex-wrap">
		<h2 class="heading">Tipos de competencias</h2>
		{#if currentID}
			<button class="btn primary">Editar tipo </button>
		{:else}
			<button class="btn primary">Agregar tipo </button>
		{/if}
	</header>

	<label class="w-full">
		<p class="label">Nombre del tipo de competencia</p>
		<input
			type="text"
			class="w-full"
			bind:value={tipoCompetenciaName}
			required
		/>
	</label>
</form>

<hr class="my-4 border-none" />

{#if $tiposCompetencias.length == 0}
	<p>No hay cursos aún.</p>
{:else}
	<table class="table-fixed table shadow-lg w-full max-w-xl">
		<thead>
			<tr>
				<th>Tipo de competencia</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="max-h-60 overflow-auto">
			{#each $tiposCompetencias as tipoCompetencia (tipoCompetencia.id)}
				<tr>
					<td>{tipoCompetencia.nombre}</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="font-bold text-accent"
								on:click={() => handleUpdate(tipoCompetencia)}
								>Editar tipo</button
							>
							<button
								class="font-bold text-text-4"
								on:click={() =>
									prompts.showPrompt({
										type: 'danger',
										message:
											'¿Estás seguro que quieres borrar este tipo de competencia? Si la borras todos los registros creados de este tipo de competencia se perderán.',
										onAccept: async () => {
											try {
												await tiposCompetencias.removeItem(
													tipoCompetencia.id
												);
												toasts.success();
											} catch (e) {
												console.error(e);
												toasts.error();
											}
										}
									})}>Eliminar tipo</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
