<script lang="ts">
	import AcreditacionForm from '$lib/components/coordinador/acreditacionForm.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { competencias } from '$lib/stores/db/competencias';
	import { cursos } from '$lib/stores/db/cursos';
	import { diplomados } from '$lib/stores/db/diplomados';
	import { docentes } from '$lib/stores/db/docentes';
	import { registrosCompetencias } from '$lib/stores/db/registrosCompetencias';
	import { registrosCursos } from '$lib/stores/db/registrosCursos';
	import { registrosDiplomados } from '$lib/stores/db/registrosDiplomados';
	import { tiposCompetencias } from '$lib/stores/db/tipoCompetencias';
	import { usuarios } from '$lib/stores/db/usuarios';
	import { useModal } from '$lib/stores/modal';
	import { dateFormat } from '$lib/utils/dateFormat';
	import type {
		RegistroCompetencia,
		RegistroCurso,
		RegistroDiplomado,
		Usuario
	} from '$lib/utils/interfaces';
	import dayjs from 'dayjs';

	import { derived, Readable } from 'svelte/store';

	const registros = derived(
		[
			registrosCompetencias,
			registrosCursos,
			registrosDiplomados,
			cursos,
			diplomados,
			competencias,
			tiposCompetencias,
			usuarios,
			docentes
		],
		([
			$registrosCompetencias,
			$registrosCursos,
			$registrosDiplomados,
			$cursos,
			$diplomados,
			$competencias,
			$tiposCompetencias,
			$usuarios,
			$docentes
		]) => {
			if (
				!(
					$registrosCompetencias &&
					$registrosCursos &&
					$registrosDiplomados &&
					$cursos &&
					$diplomados &&
					$competencias &&
					$tiposCompetencias
				)
			)
				return [];

			let registrosCursosComp = $registrosCursos.map((rC) => {
				let curso = $cursos.find((c) => c.id == rC.id_curso);

				if (!curso) return;

				return {
					...rC,
					curso: {
						...curso,
						diplomado: $diplomados.find(
							(d) => d.id == curso.id_diplomado
						)
					}
				};
			});

			let registrosCompetenciasComp = $registrosCompetencias.map(
				(rC) => {
					let competencia = $competencias.find(
						(c) => c.id == rC.id_competencia
					);

					if (!competencia) return;

					return {
						...rC,
						competencia: {
							...competencia,
							tipo: $tiposCompetencias.find(
								(u) => u.id == competencia.id_tipo
							)
						}
					};
				}
			);

			let registrosDiplomadosComp = $registrosDiplomados.map((rD) => {
				let diplomado = $diplomados.find(
					(d) => d.id == rD.id_diplomado
				);

				return {
					...rD,
					diplomado
				};
			});

			let registrosTerminados = [
				...registrosCompetenciasComp,
				...registrosCursosComp,
				...registrosDiplomadosComp
			];

			return registrosTerminados.map((r) => {
				let expeditor = $usuarios.find((u) => u.id == r.id_expeditor);
				let docenteAcreditor = $docentes.find(
					(d) => d.id == r.id_acreditor
				);
				if (!docenteAcreditor) return;
				let acreditor = $usuarios.find(
					(u) => u.id == docenteAcreditor.id_usuario
				);

				if (!expeditor) return;
				if (!acreditor) return;

				return {
					...r,
					acreditor,
					expeditor
				};
			});
		}
	);

	let acreditacionFormModal = useModal();

	let filterText: string;
	let filterGroup: string[] = [];
	let filterFunction = (any) => true;

	const handleFilterField = () => {
		if (filterText) {
			filterFunction = (registro) => {
				let fields: (keyof Usuario)[] = [
					'matricula',
					'nombre',
					'apellido_paterno',
					'apellido_materno'
				];

				return fields.some(
					(f) =>
						registro.acreditor[f]
							.toString()
							.toLowerCase()
							.includes(filterText.toLowerCase()) ||
						registro.expeditor[f]
							.toString()
							.toLowerCase()
							.includes(filterText.toLowerCase())
				);
			};
		} else {
			filterFunction = (any) => true;
		}
	};

	$: if (filterGroup.length > 0) {
		filterFunction = (registro) => {
			if ('id_diplomado' in registro) {
				return filterGroup.includes('diplomado');
			} else if ('id_curso' in registro) {
				return filterGroup.includes('curso');
			} else if ('id_competencia' in registro) {
				return filterGroup.includes('competencia');
			} else {
				return false;
			}
		};
	} else {
		filterFunction = (registro) => true;
	}
</script>

{#if $acreditacionFormModal}
	<Modal handleClose={acreditacionFormModal.closeModal}>
		<AcreditacionForm />
	</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="heading">Registros de acreditaciones</h2>
	<button
		class="btn primary"
		on:click={acreditacionFormModal.openModal}
		>Agregar acreditación
	</button>
</header>

<hr class="my-4 border-none" />

<label>
	<p class="label">Buscar usuario</p>
	<input
		type="text"
		bind:value={filterText}
		on:input={handleFilterField}
	/>
</label>

<hr class="my-4 border-none" />

<p class="label">Filtrar por</p>
<div class="flex gap-4 flex-wrap">
	<label class="flex gap-1 items-center">
		<input type="checkbox" value="curso" bind:group={filterGroup} />
		Cursos
	</label>
	<label class="flex gap-1 items-center">
		<input
			type="checkbox"
			value="diplomado"
			bind:group={filterGroup}
		/>
		Diplomados
	</label>
	<label class="flex gap-1 items-center">
		<input
			type="checkbox"
			value="competencia"
			bind:group={filterGroup}
		/>
		Competencias
	</label>
</div>

<hr class="my-4 border-none" />

<table id="table" class="table-fixed table shadow-lg w-full">
	<thead>
		<tr>
			<th>Acreditación</th>
			<th>Acreditor</th>
			<th>Expeditor</th>
			<th class="w-48">Fecha de expedición</th>
			<th>...</th>
		</tr>
	</thead>
	<tbody class="">
		{#each $registros.filter(filterFunction) as registro, i (i)}
			<tr>
				<td>
					{#if 'id_competencia' in registro}
						<p class="font-bold text-text-4 text-sm">
							Competencia {registro.competencia?.tipo?.nombre}
						</p>
						<p>
							{registro.competencia?.nombre}
						</p>
					{:else if 'id_diplomado' in registro}
						<p class="font-bold text-text-4 text-sm">Diplomado</p>
						<p>{registro.diplomado?.nombre}</p>
					{:else if 'id_curso' in registro}
						<p class="font-bold text-text-4 text-sm">Curso</p>
						<p>{registro.curso?.nombre}</p>
					{/if}
				</td>
				<td>
					<a href="#">{registro.acreditor.matricula}</a>
					<p>
						{registro.acreditor.nombre}
						{registro.acreditor.apellido_paterno}
						{registro.acreditor.apellido_materno}
					</p>
				</td>
				<td>
					<a href="#">{registro.expeditor.matricula}</a>
					<p>
						{registro.expeditor.nombre}
						{registro.expeditor.apellido_paterno}
						{registro.expeditor.apellido_materno}
					</p>
				</td>
				<td>{dayjs(registro.fecha_expedicion).format(dateFormat)}</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button class="link">Eliminar acreditación</button>
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
