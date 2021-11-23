<script lang="ts">
	import { cursos } from '$lib/stores/db/cursos';

	import { cursosEnJornada } from '$lib/stores/db/cursosEnJornada';
	import { instructoresList } from '$lib/stores/lists/instructorList';
	import { toasts } from '$lib/stores/toastlist';

	import type { Curso, Usuario } from '$lib/utils/interfaces';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';
	import { writable } from 'svelte/store';

	let formErrors = writable<string[]>([]);

	export let currentjornadaID;
	export let currentCursoID: number = undefined;
	export let isEditing = false;
	export let cupoCurso: number = undefined;
	export let cursoSeleccionado: number = undefined;
	export let instructorSeleccionado: number = undefined;
	export let cursoEstado: 0 | 1 = undefined;

	let filterTextCursos;
	let filterTextInstructores;

	const handleSubmit = async () => {
		if (!cursoSeleccionado) {
			formErrors.update((val) => [
				...val,
				'Seleccione un curso por favor'
			]);
		}

		if (!instructorSeleccionado) {
			formErrors.update((val) => [
				...val,
				'Seleccione un instructor porfavor'
			]);
		}

		if (cupoCurso && cursoSeleccionado && instructorSeleccionado) {
			formErrors.set([]);
			if (isEditing) {
				try {
					await cursosEnJornada.updateItem(currentCursoID, {
						id_jornada: currentjornadaID,
						id_instructor: instructorSeleccionado,
						cupo_maximo: cupoCurso,
						id_curso: cursoSeleccionado,
						estado: cursoEstado
					});
					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
			} else {
				try {
					await cursosEnJornada.addItem({
						id_jornada: currentjornadaID,
						id_instructor: instructorSeleccionado,
						cupo_maximo: cupoCurso,
						id_curso: cursoSeleccionado,
						estado: 0
					});
					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}

				instructorSeleccionado = undefined;
				cupoCurso = undefined;
				cursoSeleccionado = undefined;
			}
		} else {
			return;
		}
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	<header class="flex justify-between">
		<h2 class="heading">Curso de la Jornada</h2>
		{#if isEditing}
			<button class="btn primary">Editar curso</button>
		{:else}
			<button class="btn primary">Guardar curso</button>
		{/if}
	</header>

	{#if isEditing}
		<div>
			<p class="label">Estado del curso</p>
			<div class="flex justify-between">
				<label class="flex gap-2 items-center">
					<input
						type="radio"
						bind:group={cursoEstado}
						value={0}
						required
					/>
					En progreso
				</label>
				<label class="flex gap-2 items-center">
					<input
						type="radio"
						bind:group={cursoEstado}
						value={1}
						required
					/>
					Cerrado
				</label>
			</div>
		</div>
	{/if}

	<div>
		<p class="label">Cupo del curso</p>
		<input
			type="number"
			class="w-full"
			required
			min="1"
			bind:value={cupoCurso}
		/>
	</div>

	{#each $formErrors as error, i (i)}
		<p class="text-status-danger">{error}</p>
	{/each}

	<div class="ml-auto">
		<p class="label">Filtrar cursos</p>
		<input type="text" bind:value={filterTextCursos} />
	</div>

	<div>
		<p class="label">Selecciona un curso</p>
		<div class="flex flex-col gap-1 max-h-60 overflow-auto">
			{#each makeArraySearchable($cursos, ['nombre'], filterTextCursos) as curso (curso.id)}
				<label class="flex gap-2 items-center">
					<input
						type="radio"
						bind:group={cursoSeleccionado}
						value={curso.id}
						required
					/>
					{curso.nombre}
				</label>
			{/each}
		</div>
	</div>

	<div class="ml-auto">
		<p class="label">Filtrar instructor</p>
		<input type="text" bind:value={filterTextInstructores} />
	</div>

	<div>
		<p class="label">Selecciona un instructor para el curso</p>
		<div class="flex flex-col gap-1 max-h-60 overflow-auto">
			{#each makeArraySearchable($instructoresList, ['nombre', 'apellido_paterno', 'apellido_materno'], filterTextInstructores) as instructor (instructor.id)}
				<label class="flex gap-2 items-center">
					<input
						type="radio"
						bind:group={instructorSeleccionado}
						value={instructor.id_instructor}
						required
					/>
					{instructor.matricula}
					{instructor.nombre}
					{instructor.apellido_paterno}
					{instructor.apellido_materno}
				</label>
			{/each}
		</div>
	</div>
</form>
