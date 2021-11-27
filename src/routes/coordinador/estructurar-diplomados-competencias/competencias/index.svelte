<script lang="ts">
	import Modal from '$lib/components/common/modal.svelte';
	import { db_competencias } from '$lib/stores/db';
	import {
		CompetenciaConTipo,
		competenciasConTipo,
	} from '$lib/stores/lists/competenciasConTipo';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toasts';
	import { useModal } from '$lib/stores/useModal';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';
	import CompetenciaForm from './_modules/competenciaForm.svelte';

	let agregarCompetenciaModal = useModal();
	let editarCOmpetenciaModal = useModal();

	let editingCompetenciaID: number | undefined;
	let editingCompetencia: CompetenciaConTipo | undefined;
	$: editingCompetencia = $competenciasConTipo.find(
		(c) => c.id == editingCompetenciaID
	);

	let filterText: string;

	// $: competenciaEditable = $competenciasList.find(
	// 	(c) => c.id == competenciaEditableID
	// );

	let cursosModal = useModal();
</script>

{#if $agregarCompetenciaModal}
	<Modal handleClose={agregarCompetenciaModal.closeModal}>
		<CompetenciaForm />
	</Modal>
{/if}

{#if $editarCOmpetenciaModal}
	<Modal handleClose={editarCOmpetenciaModal.closeModal}>
		<CompetenciaForm
			competenciaID={editingCompetencia?.id}
			form={{
				nombre: editingCompetencia?.nombre,
				id_tipo: editingCompetencia?.id_tipo,
			}}
			selectedTipo={editingCompetencia?.id_tipo}
		/>
	</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="heading">Tabla de Competencias</h2>
	<span class="flex gap-8 items-center">
		<button class="link primary" on:click={cursosModal.openModal}
			>Gestionar tipos de competencias</button
		>
		<button class="btn primary" on:click={agregarCompetenciaModal.openModal}
			>Agregar competencias
		</button>
	</span>
</header>

<hr class="my-4 border-none" />

<p class="label">Buscar competencia</p>
<input type="text" bind:value={filterText} />

<hr class="my-4 border-none" />

{#if $competenciasConTipo.length == 0}
	<p>No hay competencias aún.</p>
{:else}
	<table id="table-diplomados" class="table-fixed table shadow-lg w-full">
		<thead>
			<tr>
				<th>Competencia</th>
				<th>Tipo</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="">
			{#each makeArraySearchable($competenciasConTipo, ['nombre'], filterText) as competencia (competencia.id)}
				<tr>
					<td>{competencia.nombre}</td>
					<td>
						{#if competencia.tipo}
							{competencia.tipo.nombre}
						{:else}
							<p class="text text-text-4">Sin tipo</p>
						{/if}
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="link primary"
								on:click={() => {
									editingCompetenciaID = competencia.id;
									editarCOmpetenciaModal.openModal();
								}}>Editar competencia</button
							>
							<button
								class="link"
								on:click={() =>
									prompts.showPrompt({
										type: 'danger',
										message:
											'¿Estás seguro que quieres borrar esta competencia? Si la borras todos los registros creados de esta competencia se perderán.',
										onAccept: async () => {
											try {
												await db_competencias.deleteItem(competencia.id);
												toasts.success();
											} catch (e) {
												console.error(e);
												toasts.error();
											}
										},
									})}>Eliminar competencia</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
