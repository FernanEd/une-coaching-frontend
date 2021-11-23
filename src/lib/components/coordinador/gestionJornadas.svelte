<script lang="ts">
	import { jornadas } from '$lib/stores/db/jornadas';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toastlist';
	import { dateFormat } from '$lib/utils/dateFormat';
	import type { Jornada } from '$lib/utils/interfaces';
	import dayjs from 'dayjs';
	import DateInput from '../common/dateInput.svelte';

	let form: Omit<Jornada, 'id'> = {
		titulo: undefined,
		fecha_inicio: undefined,
		fecha_fin: undefined,
		fecha_inscripcion_inicio: undefined,
		fecha_inscripcion_fin: undefined
	};

	let currentID;

	const handleSubmit = async () => {
		const formFields = Object.keys(form);
		const formData = { ...form };
		const fieldsFilled = formFields.every((key) => form[key]);
		const isEditing = currentID;

		if (fieldsFilled) {
			if (isEditing) {
				try {
					await jornadas.updateItem(currentID, { ...formData });
					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
				currentID = undefined;
			} else {
				try {
					await jornadas.addItem(formData);
					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
			}
			formFields.forEach((field) => (form[field] = undefined));
		}
	};

	const handleUpdate = ({
		id,
		titulo,
		fecha_inscripcion_fin,
		fecha_inscripcion_inicio,
		fecha_fin,
		fecha_inicio
	}: Jornada) => {
		currentID = id;
		form = {
			titulo,
			fecha_inicio,
			fecha_fin,
			fecha_inscripcion_inicio,
			fecha_inscripcion_fin
		};
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
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
		<label class="label"> Titulo de la jornada </label>
		<input
			type="text"
			class="w-full"
			bind:value={form.titulo}
			required
		/>
	</div>

	<div class="form-row">
		<div class="input-group">
			<label class="label"> Fecha de inicio de la jornada </label>
			<DateInput bind:date={form.fecha_inicio} />
		</div>
		<div class="input-group">
			<label class="label"> Fecha de cierre de la jornada </label>
			<DateInput bind:date={form.fecha_fin} />
		</div>
	</div>

	<div class="form-row">
		<div class="input-group">
			<label class="label"> Fecha de inicio de inscripciones </label>
			<DateInput bind:date={form.fecha_inscripcion_inicio} />
		</div>
		<div class="input-group">
			<label class="label"> Fecha de cierre de inscripciones </label>
			<DateInput bind:date={form.fecha_inscripcion_fin} />
		</div>
	</div>
</form>

<hr class="my-4 border-none" />

{#if $jornadas.length == 0}
	<p>No hay jornadas registradas aún.</p>
{:else}
	<table class="table-fixed table shadow-lg max-w-2xl w-screen">
		<thead>
			<tr>
				<th>Curso</th>
				<th>Periodo</th>
				<th>Inscripciones</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="max-h-60 overflow-auto">
			{#each $jornadas as jornada (jornada.id)}
				<tr>
					<td>{jornada.titulo}</td>
					<td>
						<p>
							Inicio: {dayjs(jornada.fecha_inicio).format(dateFormat)}
						</p>
						<p>Fin: {dayjs(jornada.fecha_fin).format(dateFormat)}</p>
					</td>
					<td>
						<p>
							Inicio: {dayjs(jornada.fecha_inscripcion_inicio).format(
								dateFormat
							)}
						</p>
						<p>
							Fin: {dayjs(jornada.fecha_inscripcion_fin).format(
								dateFormat
							)}
						</p>
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="font-bold text-accent"
								on:click={() => handleUpdate(jornada)}
								>Editar jornada</button
							>
							<button
								class="font-bold text-text-4"
								on:click={() =>
									prompts.showPrompt({
										type: 'danger',
										message: `¿Estás seguro que quieres borrar ésta jornada? Si la borras todos los registros, diplomados y cursos de ésta jornada se perderán.`,
										onAccept: async () => {
											try {
												await jornadas.removeItem(jornada.id);
												toasts.success();
											} catch (e) {
												console.error(e);
												toasts.error();
											}
										}
									})}>Eliminar jornada</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
