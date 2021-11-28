<script lang="ts">
	import { session } from '$app/stores';

	import SearchableInput from '$lib/components/common/searchableInput.svelte';
	import {
		db_competencias,
		db_coordinadores,
		db_cursos,
		db_cursosEnJornada,
		db_diplomados,
		db_registrosCompetencias,
		db_registrosCursos,
		db_registrosDiplomados,
	} from '$lib/stores/db';
	import { competenciasConTipo } from '$lib/stores/lists/competenciasConTipo';

	import { cursosConDiplomado } from '$lib/stores/lists/cursosConDiplomado';

	import { docentesComoUsuarios } from '$lib/stores/lists/docentesComoUsuario';
	import { instructoresComoUsuario } from '$lib/stores/lists/instructoresComoUsuario';
	import { usuariosConRoles } from '$lib/stores/lists/usuariosConRoles';
	import { toasts } from '$lib/stores/toasts';
	import { writable } from 'svelte/store';

	import type { CursoEnJornada } from '$lib/utils/types/db';
	import type { MayBeUndefined } from '$lib/utils/types/forms';
	import { noUndefinedValues } from '$lib/utils/noUndefinedValues';
	import { clearForm } from '$lib/utils/clearForm';

	export let editingCursoJornada: CursoEnJornada | undefined = undefined;
	export let jornadaPertenecienteID: number | undefined;
	export let instructorSeleccionado: number | null = null;
	export let estadoDelCurso: 0 | 1 = 0;
	export let form: MayBeUndefined<
		Omit<CursoEnJornada, 'id' | 'id_instructor' | 'id_jornada' | 'estado'>
	> = {
		cupo_maximo: undefined,
		id_curso: undefined,
	};

	const handleSubmit = async () => {
		let formData = { ...form };

		if (noUndefinedValues(formData) && jornadaPertenecienteID) {
			if (editingCursoJornada) {
				try {
					await db_cursosEnJornada.updateItem(editingCursoJornada.id, {
						cupo_maximo: formData.cupo_maximo,
						estado: estadoDelCurso,
						id_curso: formData.id_curso,
						id_instructor: instructorSeleccionado,
						id_jornada: jornadaPertenecienteID,
					});

					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
			} else {
				try {
					await db_cursosEnJornada.addItem({
						cupo_maximo: formData.cupo_maximo,
						estado: estadoDelCurso,
						id_curso: formData.id_curso,
						id_instructor: instructorSeleccionado,
						id_jornada: jornadaPertenecienteID,
					});

					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}

				form = clearForm(form);
			}
		}
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	<header class="flex justify-between">
		<h2 class="heading">Curso</h2>
		{#if editingCursoJornada}
			<button class="btn primary">Editar curso</button>
		{:else}
			<button class="btn primary">Guardar curso</button>
		{/if}
	</header>

	{#if editingCursoJornada}
		<div>
			<p class="label">Estado del curso</p>
			<div class="flex gap-8">
				<label class="flex gap-2 items-center">
					<input type="radio" bind:group={estadoDelCurso} value={0} required />
					En progreso
				</label>
				<label class="flex gap-2 items-center">
					<input type="radio" bind:group={estadoDelCurso} value={1} required />
					Cerrado
				</label>
			</div>
		</div>
	{/if}

	<div class="input-group">
		<p class="label">Cupo del curso</p>
		<input type="number" required min="1" bind:value={form.cupo_maximo} />
	</div>

	<div class="input-group">
		<p class="label">Selecciona un curso</p>
		<SearchableInput
			bind:selected={form.id_curso}
			listToSearch={$cursosConDiplomado}
			searchFields={['nombre']}
			valueKey="id"
			isRequired
		/>
	</div>

	<div class="input-group">
		<p class="label">Selecciona un instructor (opcional)</p>
		<SearchableInput
			bind:selected={instructorSeleccionado}
			listToSearch={$instructoresComoUsuario}
			searchFields={['nombre', 'apellido_paterno', 'apellido_materno']}
			valueKey="id_instructor"
		/>
	</div>
</form>
