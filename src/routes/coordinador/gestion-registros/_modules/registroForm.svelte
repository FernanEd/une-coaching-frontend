<script lang="ts">
	import SearchableInput from '$lib/components/common/searchableInput.svelte';
	import { db_competencias, db_cursos, db_diplomados } from '$lib/stores/db';
	import { competenciasConTipo } from '$lib/stores/lists/competenciasConTipo';

	import { cursosConDiplomado } from '$lib/stores/lists/cursosConDiplomado';

	import { docentesComoUsuarios } from '$lib/stores/lists/docentesComoUsuario';
	import { usuariosConRoles } from '$lib/stores/lists/usuariosConRoles';
	import { writable } from 'svelte/store';

	let formErrors = writable<string[]>([]);

	let isEditing = false;

	let acreditorSeleccionado: number;
	let tipoDeAcreditacionSeleccionada:
		| 'curso'
		| 'diplomado'
		| 'competencia'
		| undefined = undefined;

	let filterTextCursos;
	let filterTextAcreditores;

	const handleSubmit = async () => {
		console.log('oooh');
		// if (
		// 	acreditorSeleccionado &&
		// 	tipoDeAcreditacionSeleccionada &&
		// 	acreditacionSeleccionada
		// ) {
		// 	formErrors.set([]);
		// 	if (tipoDeAcreditacionSeleccionada == 'curso') {
		// 		registrosCursos.addItem({
		// 			id_curso: acreditacionSeleccionada,
		// 			id_acreditor: acreditorSeleccionado,
		// 			acreditado: false,
		// 			cursado: false,
		// 			documento: '',
		// 			fecha_expedicion: new Date(),
		// 			id_expeditor: $currentUser.id,
		// 		});
		// 	} else if (tipoDeAcreditacionSeleccionada == 'diplomado') {
		// 		registrosDiplomados.addItem({
		// 			id_diplomado: acreditacionSeleccionada,
		// 			id_acreditor: acreditorSeleccionado,
		// 			documento: '',
		// 			fecha_expedicion: new Date(),
		// 			id_expeditor: $currentUser.id,
		// 		});
		// 	} else if (tipoDeAcreditacionSeleccionada == 'competencia') {
		// 		registrosCompetencias.addItem({
		// 			id_competencia: acreditacionSeleccionada,
		// 			id_acreditor: acreditorSeleccionado,
		// 			documento: '',
		// 			fecha_expedicion: new Date(),
		// 			id_expeditor: $currentUser.id,
		// 		});
		// 	}
		// } else {
		// 	formErrors.set(['Por favor selecciona todos los campos']);
		// 	return;
		// }
	};

	let docenteSeleccionado: number | undefined;
	let acreditacionSeleccionada: number | undefined;

	$: console.log(docenteSeleccionado);
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

	{#if $formErrors.length > 0}
		{#each $formErrors as error, i (i)}
			<p class="label text-status-danger">{error}</p>
		{/each}
	{/if}

	<div class="input-group">
		<p class="label">Selecciona un acreditor</p>
		<SearchableInput
			bind:selected={docenteSeleccionado}
			listToSearch={$docentesComoUsuarios}
			searchFields={['nombre', 'apellido_paterno', 'apellido_materno']}
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
			/>
		{:else if tipoDeAcreditacionSeleccionada == 'diplomado'}
			<p class="label">Selecciona un diplomado</p>
			<SearchableInput
				bind:selected={acreditacionSeleccionada}
				listToSearch={$db_diplomados}
				searchFields={['nombre']}
			/>
		{:else if tipoDeAcreditacionSeleccionada == 'competencia'}
			<p class="label">Selecciona una competencia</p>
			<SearchableInput
				bind:selected={acreditacionSeleccionada}
				listToSearch={$db_competencias}
				searchFields={['nombre']}
			/>
		{/if}
	</div>
</form>
