<script lang="ts">
	import { db_tiposCompetencias } from '$lib/stores/db';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toasts';
	import { clearForm } from '$lib/utils/clearForm';
	import { handleError } from '$lib/utils/handleError';

	import { noUndefinedValues } from '$lib/utils/noUndefinedValues';

	import type { TipoCompetencia } from '$lib/utils/types/db';
	import type { MayBeUndefined } from '$lib/utils/types/forms';

	let form: MayBeUndefined<Omit<TipoCompetencia, 'id'>> = {
		nombre: undefined,
	};
	let currentID: number | undefined;

	const handleSubmit = async () => {
		if (noUndefinedValues(form)) {
			if (currentID) {
				try {
					await db_tiposCompetencias.updateItem(currentID, {
						nombre: form.nombre,
					});

					toasts.success();
				} catch (e) {
					handleError(e);
				}
			} else {
				try {
					await db_tiposCompetencias.addItem({
						nombre: form.nombre,
					});

					currentID = undefined;
					form = clearForm(form);
					toasts.success();
				} catch (e) {
					handleError(e);
				}
			}
		}
	};

	const updateForm = (tipoCompetencia: TipoCompetencia) => {
		currentID = tipoCompetencia.id;
		form.nombre = tipoCompetencia.nombre;
	};
</script>

<form
	on:submit|preventDefault={currentID
		? () =>
				prompts.showPrompt({
					type: 'danger',
					message:
						'Editar una competencia repercutirá en todos los registros de acreditaciones. ¿Estás seguro?',
					onAccept: handleSubmit,
				})
		: handleSubmit}
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
		<input type="text" class="w-full" bind:value={form.nombre} required />
	</label>
</form>

<hr class="my-4 border-none" />

{#if $db_tiposCompetencias.length == 0}
	<p>No hay tipos de competencias aún.</p>
{:else}
	<table class="table-fixed table shadow-lg w-full max-w-xl">
		<thead>
			<tr>
				<th>Tipo de competencia</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="max-h-60 overflow-auto">
			{#each $db_tiposCompetencias as tipoCompetencia (tipoCompetencia.id)}
				<tr>
					<td>{tipoCompetencia.nombre}</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="font-bold text-accent"
								on:click={() => updateForm(tipoCompetencia)}>Editar tipo</button
							>
							<button
								class="font-bold text-text-4"
								on:click={() =>
									prompts.showPrompt({
										type: 'danger',
										message:
											'¿Estás seguro que quieres borrar este tipo de competencia? Si la borras todos los registros creados de este tipo de competencia se verán afectados.',
										onAccept: async () => {
											try {
												await db_tiposCompetencias.deleteItem(
													tipoCompetencia.id
												);
												toasts.success();
											} catch (e) {
												console.error(e);
												toasts.error();
											}
										},
									})}>Eliminar tipo</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
