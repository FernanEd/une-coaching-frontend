<script lang="ts">
	import { session } from '$app/stores';

	import SearchableInput from '$lib/components/common/searchableInput.svelte';
	import {
		db_competencias,
		db_coordinadores,
		db_cursos,
		db_diplomados,
		db_registrosCompetencias,
		db_registrosCursos,
		db_registrosDiplomados,
	} from '$lib/stores/db';
	import { competenciasConTipo } from '$lib/stores/lists/competenciasConTipo';

	import { cursosConDiplomado } from '$lib/stores/lists/cursosConDiplomado';

	import { docentesComoUsuarios } from '$lib/stores/lists/docentesComoUsuario';
	import { usuariosConRoles } from '$lib/stores/lists/usuariosConRoles';
	import { toasts } from '$lib/stores/toasts';
	import { writable } from 'svelte/store';

	let isEditing = false;
	let docenteSeleccionado: number | undefined;
	let acreditacionSeleccionada: number | undefined;
	let tipoDeAcreditacionSeleccionada:
		| 'curso'
		| 'diplomado'
		| 'competencia'
		| undefined = undefined;

	let coordinadorID: number | undefined;
	$: coordinadorID = $db_coordinadores.find(
		(c) => c.id == $session.user.id
	)?.id;

	$: console.log('id coord:', coordinadorID);

	$: console.log(docenteSeleccionado);

	const handleSubmit = async () => {
		if (
			docenteSeleccionado &&
			tipoDeAcreditacionSeleccionada &&
			acreditacionSeleccionada &&
			coordinadorID
		) {
			try {
				if (tipoDeAcreditacionSeleccionada == 'curso') {
					await db_registrosCursos.addItem({
						id_curso: acreditacionSeleccionada,
						id_acreditor: docenteSeleccionado,
						documento: undefined,
						fecha_expedicion: new Date(),
						id_expeditor: coordinadorID,
					});
				} else if (tipoDeAcreditacionSeleccionada == 'diplomado') {
					await db_registrosDiplomados.addItem({
						id_diplomado: acreditacionSeleccionada,
						id_acreditor: docenteSeleccionado,
						documento: undefined,
						fecha_expedicion: new Date(),
						id_expeditor: coordinadorID,
					});
				} else if (tipoDeAcreditacionSeleccionada == 'competencia') {
					await db_registrosCompetencias.addItem({
						id_competencia: acreditacionSeleccionada,
						id_acreditor: docenteSeleccionado,
						documento: undefined,
						fecha_expedicion: new Date(),
						id_expeditor: coordinadorID,
					});
				}
				toasts.success();
			} catch (e) {
				console.error(e);
				toasts.error();
			}
		}
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	<header class="flex justify-between">
		<h2 class="heading">Acreditación</h2>
		{#if isEditing}
			<button class="btn primary">Agregar Acreditación</button>
		{:else}
			<button class="btn primary">Guardar Acreditación</button>
		{/if}
	</header>

	<div class="input-group">
		<p class="label">Selecciona un acreditor</p>
		<SearchableInput
			bind:selected={docenteSeleccionado}
			listToSearch={$docentesComoUsuarios}
			searchFields={['nombre', 'apellido_paterno', 'apellido_materno']}
			valueKey="id_docente"
			isRequired
		/>
	</div>

	<div>
		<p class="label">Tipo de acreditacion</p>
		<select bind:value={tipoDeAcreditacionSeleccionada} required>
			<option value="" disabled>Selecciona uno</option>
			<option value="curso">Curso</option>
			<option value="diplomado">Diplomado</option>
			<option value="competencia">Competencia</option>
		</select>
	</div>

	<div class="input-group">
		{#if tipoDeAcreditacionSeleccionada == 'curso'}
			<p class="label">Selecciona un curso</p>
			<SearchableInput
				bind:selected={acreditacionSeleccionada}
				listToSearch={$db_cursos}
				searchFields={['nombre']}
				isRequired
			/>
		{:else if tipoDeAcreditacionSeleccionada == 'diplomado'}
			<p class="label">Selecciona un diplomado</p>
			<SearchableInput
				bind:selected={acreditacionSeleccionada}
				listToSearch={$db_diplomados}
				searchFields={['nombre']}
				isRequired
			/>
		{:else if tipoDeAcreditacionSeleccionada == 'competencia'}
			<p class="label">Selecciona una competencia</p>
			<SearchableInput
				bind:selected={acreditacionSeleccionada}
				listToSearch={$db_competencias}
				searchFields={['nombre']}
				isRequired
			/>
		{/if}
	</div>
</form>
