<script lang="ts">
	import { cursos } from '$lib/stores/db';
	import type { Jornada } from '$lib/utils/interfaces';

	let form: Omit<Jornada, 'id'> = {
		titulo: undefined,
		fecha_inicio: undefined,
		fecha_fin: undefined,
		fecha_inscripcion_inicio: undefined,
		fecha_inscripcion_fin: undefined
	};

	let currentID;

	const handleSubmit = () => {
		// if (cursoName) {
		// 	if (currentID) {
		// 		cursos.updateItem(currentID, { nombre: cursoName });
		// 		currentID = undefined;
		// 	} else {
		// 		cursos.addItem({ nombre: cursoName, id_diplomado: null });
		// 	}
		// 	cursoName = '';
		// }
	};

	const handleUpdate = (jornada: Jornada) => {
		// currentID = curso.id;
		// cursoName = curso.nombre;
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
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
			<input
				type="date"
				class="w-full"
				bind:value={form.titulo}
				required
			/>
		</div>
		<div class="input-group">
			<label class="label"> Fecha de cierre de la jornada </label>
			<input
				type="date"
				class="w-full"
				bind:value={form.titulo}
				required
			/>
		</div>
	</div>

	<div class="form-row">
		<div class="input-group">
			<label class="label"> Fecha de inicio de inscripciones </label>
			<input
				type="date"
				class="w-full"
				bind:value={form.titulo}
				required
			/>
		</div>
		<div class="input-group">
			<label class="label"> Fecha de cierre de inscripciones </label>
			<input
				type="date"
				class="w-full"
				bind:value={form.titulo}
				required
			/>
		</div>
	</div>
</form>

<!-- <hr class="my-4 border-none" />

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
								on:click={() => cursos.removeItem(curso.id)}
								>Eliminar curso</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if} -->
