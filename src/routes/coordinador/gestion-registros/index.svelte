<script lang="ts">
	import Modal from '$lib/components/common/modal.svelte';
	import { db_usuarios } from '$lib/stores/db';
	import { registrosAcreditaciones } from '$lib/stores/lists/registrosAcreditaciones';
	import type { RegistroAcreditacion } from '$lib/stores/lists/registrosAcreditaciones';
	import { prompts } from '$lib/stores/prompts';
	import { useModal } from '$lib/stores/useModal';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';
	import RegistroForm from './_modules/registroForm.svelte';

	let filterText: string;
	let filterFunction: (registro: RegistroAcreditacion) => boolean;
	let filterGroup: string[] = [];
	$: if (filterGroup.length > 0) {
		filterFunction = (registro) => filterGroup.includes(registro.tipo);
	} else {
		filterFunction = (usuario) => true;
	}

	let editingRegistroID: number | undefined;
	let editingRegistro: RegistroAcreditacion | undefined;
	$: editingRegistro = $registrosAcreditaciones.find(
		(r) => r.id == editingRegistroID
	);

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

<p class="label">Filtrar registros por</p>
<div class="flex gap-4 flex-wrap">
	<label class="flex gap-1 items-center">
		<input type="checkbox" value="cursos" bind:group={filterGroup} />
		Cursos
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" value="diplomados" bind:group={filterGroup} />
		Diplomados
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" value="competencias" bind:group={filterGroup} />
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
		{#each makeArraySearchable($registrosAcreditaciones, ['fecha_expedicion'], filterText).filter(filterFunction) as registro (registro.id)}
			<tr>
				<td />
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
					{registro.fecha_expedicion}
				</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button
							class="link primary"
							on:click={() => {
								editingRegistroID = registro.id;
								editarRegistroForm.openModal();
							}}>Editar registro</button
						>

						<button
							class="link"
							on:click={() => {
								prompts.showPrompt({
									message: `¿Estás seguro que quieres borrar este registro de acreditación?.`,
									type: 'danger',
									onAccept: () => db_usuarios.deleteItem(registro.id),
								});
							}}>Eliminar registro</button
						>
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
