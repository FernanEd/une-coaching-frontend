<script lang="ts">
	import Modal from '$lib/components/common/modal.svelte';
	import {
		db_registrosCompetencias,
		db_registrosCursos,
		db_registrosDiplomados,
		db_usuarios,
	} from '$lib/stores/db';
	import { registrosAcreditaciones } from '$lib/stores/lists/registrosAcreditaciones';
	import type { RegistroAcreditacion } from '$lib/stores/lists/registrosAcreditaciones';
	import { prompts } from '$lib/stores/prompts';
	import { useModal } from '$lib/stores/useModal';
	import {
		makeArraySearchable,
		parseAccents,
	} from '$lib/utils/makeArraySearchable';
	import RegistroForm from './_modules/registroForm.svelte';
	import { formatDate } from '$lib/utils/formatDate';
	import { toasts } from '$lib/stores/toasts';
	import dayjs from 'dayjs';

	let filterText: string;
	let filterFunction: (registro: RegistroAcreditacion) => boolean;
	let filterGroupFunction: (registro: RegistroAcreditacion) => boolean;
	let filterGroup: string[] = [];
	$: if (filterGroup.length > 0) {
		filterGroupFunction = (registro) => filterGroup.includes(registro.tipo);
	} else {
		filterGroupFunction = (registro) => true;
	}

	let orderDirection: 'reciente' | 'antiguo' = 'reciente';
	let orderFunction: (
		registroAnterior: RegistroAcreditacion,
		registroPosterior: RegistroAcreditacion
	) => number;

	$: {
		if (orderDirection == 'reciente') {
			orderFunction = (a, b) =>
				dayjs(a.fecha_expedicion).isAfter(b.fecha_expedicion) ? -1 : 1;
		} else {
			orderFunction = (a, b) =>
				dayjs(a.fecha_expedicion).isAfter(b.fecha_expedicion) ? 1 : -1;
		}
	}

	$: {
		if (filterText) {
			filterFunction = (registro) => {
				let acreditorNombre =
					`${registro.acreditor.nombre} ${registro.acreditor.apellido_paterno} ${registro.acreditor.apellido_materno}`
						.split('')
						.map((l) => parseAccents(l).toLowerCase())
						.join('');
				let expeditorNombre =
					`${registro.expeditor.nombre} ${registro.expeditor.apellido_paterno} ${registro.expeditor.apellido_materno}`
						.split('')
						.map((l) => parseAccents(l).toLowerCase())
						.join('');

				console.log(filterText, acreditorNombre, expeditorNombre);

				let searchWords = filterText.split(/\s/);

				return searchWords.every(
					(word) =>
						acreditorNombre.match(new RegExp(parseAccents(word), 'i')) ||
						expeditorNombre.match(new RegExp(parseAccents(word), 'i'))
				);
			};
		} else {
			filterFunction = (r) => true;
		}
	}

	const agregarRegistroForm = useModal();
	const editarRegistroForm = useModal();
</script>

{#if $agregarRegistroForm}
	<Modal handleClose={agregarRegistroForm.closeModal}>
		<RegistroForm />
	</Modal>
{/if}

{#if $editarRegistroForm}
	<Modal handleClose={editarRegistroForm.closeModal}>
		<RegistroForm />
	</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="heading">Registros de acreditaciones</h2>
	<button class="btn primary" on:click={agregarRegistroForm.openModal}
		>Agregar registros
	</button>
</header>

<hr class="my-4 border-none" />

<p class="label">Buscar usuario en los registros</p>
<input type="text" bind:value={filterText} />

<hr class="my-4 border-none" />

<div class="flex justify-between">
	<div>
		<p class="label">Filtrar registros por</p>
		<div class="flex gap-4 flex-wrap">
			<label class="flex gap-1 items-center">
				<input type="checkbox" value="curso" bind:group={filterGroup} />
				Cursos
			</label>
			<label class="flex gap-1 items-center">
				<input type="checkbox" value="diplomado" bind:group={filterGroup} />
				Diplomados
			</label>
			<label class="flex gap-1 items-center">
				<input type="checkbox" value="competencia" bind:group={filterGroup} />
				Competencias
			</label>
		</div>
	</div>
	<div>
		<p class="label">Ordenar por</p>
		<div class="flex gap-8">
			<button
				class="link"
				class:primary={orderDirection == 'reciente'}
				on:click={() => {
					orderDirection = 'reciente';
				}}>Más recientes</button
			>
			/
			<button
				class="link"
				class:primary={orderDirection == 'antiguo'}
				on:click={() => {
					orderDirection = 'antiguo';
				}}>Más antiguas</button
			>
		</div>
	</div>
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
		{#each $registrosAcreditaciones
			.sort(orderFunction)
			.filter(filterFunction)
			.filter(filterGroupFunction) as registro, i (i)}
			<tr>
				<td>
					{#if registro.tipo == 'curso'}
						<p class="label">
							Curso - {registro.curso.diplomado?.nombre || 'sin diplomado'}
						</p>
						<p>{registro.curso.nombre}</p>
					{:else if registro.tipo == 'diplomado'}
						<p class="label">Diplomado</p>
						<p>{registro.diplomado.nombre}</p>
					{:else if registro.tipo == 'competencia'}
						<p class="label">
							Competencia - {registro.competencia.tipo?.nombre || 'sin tipo'}
						</p>
						<p>Competencia {registro.competencia.nombre}</p>
					{/if}
				</td>
				<td
					>{registro.acreditor.nombre}
					{registro.acreditor.apellido_paterno}
					{registro.acreditor.apellido_materno}</td
				>
				<td
					>{registro.expeditor.nombre}
					{registro.expeditor.apellido_paterno}
					{registro.expeditor.apellido_materno}</td
				>
				<td>
					{formatDate(registro.fecha_expedicion)}
				</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button
							class="link"
							on:click={() => {
								prompts.showPrompt({
									message: `¿Estás seguro que quieres borrar este registro de acreditación?.`,
									type: 'danger',
									onAccept: async () => {
										try {
											if (registro.tipo == 'curso')
												await db_registrosCursos.deleteItem(registro.id);
											else if (registro.tipo == 'diplomado')
												await db_registrosDiplomados.deleteItem(registro.id);
											else if (registro.tipo == 'competencia')
												await db_registrosCompetencias.deleteItem(registro.id);

											toasts.success();
										} catch (e) {
											console.error(e);
											toasts.error();
										}
									},
								});
							}}>Eliminar registro</button
						>
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
