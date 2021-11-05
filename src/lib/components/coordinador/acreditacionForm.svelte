<script lang="ts">
	import { currentUser } from '$lib/stores/currentUser';

	import { competencias } from '$lib/stores/db/competencias';

	import { cursos } from '$lib/stores/db/cursos';

	import { cursosEnJornada } from '$lib/stores/db/cursosEnJornada';
	import { diplomados } from '$lib/stores/db/diplomados';
	import { registrosCompetencias } from '$lib/stores/db/registrosCompetencias';
	import { registrosCursos } from '$lib/stores/db/registrosCursos';
	import { registrosDiplomados } from '$lib/stores/db/registrosDiplomados';
	import { docentesList } from '$lib/stores/lists/docentesList';
	import { instructoresList } from '$lib/stores/lists/instructorList';
	import { usuarioList } from '$lib/stores/lists/usuariosList';

	import type { Curso, Usuario } from '$lib/utils/interfaces';
	import { writable } from 'svelte/store';

	let formErrors = writable<string[]>([]);

	let isEditing = false;

	let acreditorSeleccionado: number;
	let tipoDeAcreditacionSeleccionada;
	let acreditacionSeleccionada;

	let filterTextCursos;
	let filterFunctionCursos: (val: Curso) => boolean = (val) => true;

	let filterTextAcreditores;
	let filterFunctionAcreditores: (val: Usuario) => boolean = (val) =>
		true;

	const handleSubmit = async () => {
		if (
			acreditorSeleccionado &&
			tipoDeAcreditacionSeleccionada &&
			acreditacionSeleccionada
		) {
			formErrors.set([]);
			if (tipoDeAcreditacionSeleccionada == 'curso') {
				registrosCursos.addItem({
					id_curso: acreditacionSeleccionada,
					id_acreditor: acreditorSeleccionado,
					acreditado: false,
					cursado: false,
					documento: '',
					fecha_expedicion: new Date(),
					id_expeditor: $currentUser.id
				});
			} else if (tipoDeAcreditacionSeleccionada == 'diplomado') {
				registrosDiplomados.addItem({
					id_diplomado: acreditacionSeleccionada,
					id_acreditor: acreditorSeleccionado,
					documento: '',
					fecha_expedicion: new Date(),
					id_expeditor: $currentUser.id
				});
			} else if (tipoDeAcreditacionSeleccionada == 'competencia') {
				registrosCompetencias.addItem({
					id_competencia: acreditacionSeleccionada,
					id_acreditor: acreditorSeleccionado,
					documento: '',
					fecha_expedicion: new Date(),
					id_expeditor: $currentUser.id
				});
			}
		} else {
			formErrors.set(['Por favor selecciona todos los campos']);
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
		if (filterTextAcreditores) {
			filterFunctionAcreditores = (val) =>
				val.matricula.toString().includes(filterTextAcreditores);
		} else {
			filterFunctionAcreditores = (val) => true;
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
			<button class="btn primary">Agregar Acreditación</button>
		{/if}
	</header>

	{#if $formErrors.length > 0}
		{#each $formErrors as error, i (i)}
			<p class="label text-status-danger">{error}</p>
		{/each}
	{/if}

	<div class="ml-auto">
		<p class="label">Filtrar instructor por matricula</p>
		<input
			type="text"
			bind:value={filterTextAcreditores}
			on:input={handleFilterInstructores}
		/>
	</div>

	<div>
		<p class="label">Selecciona un acreditor</p>
		<div class="flex flex-col gap-1 max-h-60 overflow-auto">
			{#each $docentesList.filter(filterFunctionAcreditores) as docente (docente.id)}
				<label class="flex gap-2 items-center">
					<input
						type="radio"
						bind:group={acreditorSeleccionado}
						value={docente.id_docente}
						required
					/>
					{docente.matricula}
					{docente.nombre}
					{docente.apellido_paterno}
					{docente.apellido_materno}
				</label>
			{/each}
		</div>
	</div>

	<div>
		<p class="label">Tipo de acreditacion</p>
		<select name="" bind:value={tipoDeAcreditacionSeleccionada}>
			<option selected disabled>Selecciona uno</option>
			<option value="curso">Curso</option>
			<option value="diplomado">Diplomado</option>
			<option value="competencia">Competencia</option>
		</select>
	</div>

	{#if tipoDeAcreditacionSeleccionada == 'curso'}
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
							bind:group={acreditacionSeleccionada}
							value={curso.id}
							required
						/>
						{curso.nombre}
					</label>
				{/each}
			</div>
		</div>
	{:else if tipoDeAcreditacionSeleccionada == 'diplomado'}
		<div>
			<p class="label">Selecciona un diplomado</p>
			<div class="flex flex-col gap-1 max-h-60 overflow-auto">
				{#each $diplomados as diplomado (diplomado.id)}
					<label class="flex gap-2 items-center">
						<input
							type="radio"
							bind:group={acreditacionSeleccionada}
							value={diplomado.id}
							required
						/>
						{diplomado.nombre}
					</label>
				{/each}
			</div>
		</div>
	{:else if tipoDeAcreditacionSeleccionada == 'competencia'}
		<div>
			<p class="label">Selecciona una competencia</p>
			<div class="flex flex-col gap-1 max-h-60 overflow-auto">
				{#each $competencias as competencia (competencia.id)}
					<label class="flex gap-2 items-center">
						<input
							type="radio"
							bind:group={acreditacionSeleccionada}
							value={competencia.id}
							required
						/>
						{competencia.nombre}
					</label>
				{/each}
			</div>
		</div>
	{/if}
</form>
