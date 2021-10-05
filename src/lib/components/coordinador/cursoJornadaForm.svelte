<script lang="ts">
	import {
		cursos,
		cursosEnJornada,
		diplomados
	} from '$lib/stores/db';
	import { instructoresList } from '$lib/stores/instructorList';
	import type { Curso, Usuario } from '$lib/utils/interfaces';
	import { writable } from 'svelte/store';

	let formErrors = writable<string[]>([]);

	export let currentjornadaID;
	export let isEditing = false;
	export let cupoCurso: number = undefined;
	export let cursoSeleccionado: number = undefined;
	export let instructorSeleccionado: number = undefined;

	let filterTextCursos;
	let filterFunctionCursos: (val: Curso) => boolean = (val) => true;

	let filterTextInstructores;
	let filterFunctionInstructores: (val: Usuario) => boolean = (val) =>
		true;

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
			} else {
				cursosEnJornada.addItem({
					id_jornada: currentjornadaID,
					id_instructor: instructorSeleccionado,
					cupo_maximo: cupoCurso,
					id_curso: cursoSeleccionado
				});

				instructorSeleccionado = undefined;
				cupoCurso = undefined;
				cursoSeleccionado = undefined;
			}
		} else {
			return;
		}
	};

	const handleFilterCursos = () => {
		if (filterTextCursos) {
			filterFunctionCursos = (val) =>
				val.nombre.includes(filterTextCursos);
		} else {
			filterFunctionCursos = (val) => true;
		}
	};

	const handleFilterInstructores = () => {
		if (filterTextInstructores) {
			filterFunctionInstructores = (val) =>
				val.matricula.toString().includes(filterTextInstructores);
		} else {
			filterFunctionInstructores = (val) => true;
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
			<button class="btn primary">Agregar curso</button>
		{/if}
	</header>

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
		<input
			type="text"
			bind:value={filterTextCursos}
			on:input={handleFilterCursos}
		/>
	</div>

	<div>
		<p class="label">Selecciona un curso</p>
		<div class="flex flex-col gap-1 max-h-60 overflow-auto">
			{#each $cursos.filter(filterFunctionCursos) as curso (curso.id)}
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
		<p class="label">Filtrar instructor por matricula</p>
		<input
			type="text"
			bind:value={filterTextInstructores}
			on:input={handleFilterInstructores}
		/>
	</div>

	<div>
		<p class="label">Selecciona un instructor para el curso</p>
		<div class="flex flex-col gap-1 max-h-60 overflow-auto">
			{#each $instructoresList.filter(filterFunctionInstructores) as instructor (instructor.id)}
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
