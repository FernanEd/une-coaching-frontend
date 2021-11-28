<script lang="ts">
	import type { MayBeUndefined } from '$lib/utils/types/forms';
	import { noUndefinedValues } from '$lib/utils/noUndefinedValues';
	import { clearForm } from '$lib/utils/clearForm';
	import type { Jornada } from '$lib/utils/types/db';
	import { db_jornadas } from '$lib/stores/db';
	import { toasts } from '$lib/stores/toasts';
	import { formatDate } from '$lib/utils/formatDate';
	import { prompts } from '$lib/stores/prompts';
	import DateInput from '$lib/components/common/dateInput.svelte';

	let form: MayBeUndefined<Omit<Jornada, 'id'>> = {
		titulo: undefined,
		fecha_inicio: undefined,
		fecha_fin: undefined,
		fecha_inscripcion_inicio: undefined,
		fecha_inscripcion_fin: undefined,
	};

	let currentID: number | undefined;

	const handleSubmit = async () => {
		const formData = { ...form };

		if (noUndefinedValues(formData)) {
			if (currentID) {
				try {
					await db_jornadas.updateItem(currentID, {
						titulo: formData.titulo,
						fecha_fin: formData.fecha_fin,
						fecha_inicio: formData.fecha_inicio,
						fecha_inscripcion_fin: formData.fecha_inscripcion_fin,
						fecha_inscripcion_inicio: formData.fecha_inscripcion_inicio,
					});
					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
				currentID = undefined;
			} else {
				try {
					await db_jornadas.addItem({
						titulo: formData.titulo,
						fecha_fin: formData.fecha_fin,
						fecha_inicio: formData.fecha_inicio,
						fecha_inscripcion_fin: formData.fecha_inscripcion_fin,
						fecha_inscripcion_inicio: formData.fecha_inscripcion_inicio,
					});
					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
			}
			form = clearForm(form);
		}
	};

	const handleUpdate = ({
		id,
		titulo,
		fecha_inscripcion_fin,
		fecha_inscripcion_inicio,
		fecha_fin,
		fecha_inicio,
	}: Jornada) => {
		currentID = id;
		form = {
			titulo,
			fecha_inicio,
			fecha_fin,
			fecha_inscripcion_inicio,
			fecha_inscripcion_fin,
		};

		console.log;
	};
</script>

<form
	on:submit|preventDefault={currentID
		? () =>
				prompts.showPrompt({
					type: 'danger',
					message:
						'Editar una jornada repercutirá en todos los registros de acreditaciones. ¿Estás seguro?',
					onAccept: handleSubmit,
				})
		: handleSubmit}
	class="flex flex-col max-w-2xl w-screen gap-4 "
>
	<header class="flex justify-between flex-wrap">
		<h2 class="heading">Jornadas</h2>
		{#if currentID}
			<button class="btn primary">Editar jornada</button>
		{:else}
			<button class="btn primary">Agregar jornada</button>
		{/if}
	</header>

	<div class="input-group">
		<p class="label">Titulo de la jornada</p>
		<input type="text" class="w-full" bind:value={form.titulo} required />
	</div>

	<div class="form-row">
		<div class="input-group">
			<p class="label">Fecha de inicio de la jornada</p>
			<DateInput bind:date={form.fecha_inicio} required />
		</div>
		<div class="input-group">
			<p class="label">Fecha de cierre de la jornada</p>
			<DateInput bind:date={form.fecha_fin} required />
		</div>
	</div>

	<div class="form-row">
		<div class="input-group">
			<p class="label">Fecha de inicio de inscripciones</p>
			<DateInput bind:date={form.fecha_inscripcion_inicio} required />
		</div>
		<div class="input-group">
			<p class="label">Fecha de cierre de inscripciones</p>
			<DateInput bind:date={form.fecha_inscripcion_fin} required />
		</div>
	</div>
</form>

<hr class="my-4 border-none" />

{#if $db_jornadas.length == 0}
	<p>No hay jornadas registradas aún.</p>
{:else}
	<table class="table-fixed table shadow-lg max-w-2xl w-screen">
		<thead>
			<tr>
				<th>Jornada</th>
				<th>Periodo</th>
				<th>Inscripciones</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="max-h-60 overflow-auto">
			{#each $db_jornadas as jornada (jornada.id)}
				<tr>
					<td>{jornada.titulo}</td>
					<td>
						<p>
							Inicio: {formatDate(jornada.fecha_inicio, true)}
						</p>
						<p>Fin: {formatDate(jornada.fecha_fin, true)}</p>
					</td>
					<td>
						<p>
							Inicio: {formatDate(jornada.fecha_inscripcion_inicio, true)}
						</p>
						<p>
							Fin: {formatDate(jornada.fecha_inscripcion_fin, true)}
						</p>
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="font-bold text-accent"
								on:click={() => handleUpdate(jornada)}>Editar jornada</button
							>
							<button
								class="font-bold text-text-4"
								on:click={() =>
									prompts.showPrompt({
										type: 'danger',
										message: `¿Estás seguro que quieres borrar ésta jornada? Si la borras todos los registros, diplomados y cursos de ésta jornada se perderán.`,
										onAccept: async () => {
											try {
												await db_jornadas.deleteItem(jornada.id);
												toasts.success();
											} catch (e) {
												console.error(e);
												toasts.error();
											}
										},
									})}>Eliminar jornada</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
