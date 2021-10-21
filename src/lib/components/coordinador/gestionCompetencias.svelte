<script lang="ts">
	import DiplomadoForm from '$lib/components/coordinador/diplomadoForm.svelte';
	import GestionCursos from '$lib/components/coordinador/gestionCursos.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { competencias } from '$lib/stores/db/competencias';
	import { cursos } from '$lib/stores/db/cursos';
	import { diplomados } from '$lib/stores/db/diplomados';
	import { tiposCompetencias } from '$lib/stores/db/tipoCompetencias';
	import { useModal } from '$lib/stores/modal';
	import { derived } from 'svelte/store';
	import CompetenciaForm from './competenciaForm.svelte';
	import GestionTiposCompetencia from './gestionTiposCompetencia.svelte';

	let agregarCompetenciaModal = useModal();
	let editarCOmpetenciaModal = useModal();
	let listaCompetencias = derived(
		[competencias, tiposCompetencias],
		([$competencias, $tiposCompetencias]) =>
			$competencias.map((c) => ({
				...c,
				tipo: $tiposCompetencias.find((t) => t.id == c.id_tipo)
			}))
	);

	let competenciaEditableID: number;
	$: competenciaEditable = $listaCompetencias.find(
		(c) => c.id == competenciaEditableID
	);
	let cursosModal = useModal();
</script>

{#if $agregarCompetenciaModal}
	<Modal handleClose={agregarCompetenciaModal.closeModal}>
		<CompetenciaForm />
	</Modal>
{/if}

{#if $cursosModal}
	<Modal handleClose={cursosModal.closeModal}>
		<GestionTiposCompetencia />
	</Modal>
{/if}

{#if $editarCOmpetenciaModal}
	<Modal handleClose={editarCOmpetenciaModal.closeModal}>
		<!-- <DiplomadoForm
			isEditing
			diplomadoID={competenciaEditable.id}
			nombreDiplomado={competenciaEditable.nombre}
			cursosSeleccionados={competenciaEditable.listaCursos.map(
				(c) => c.id
			)}
		/> -->
		<CompetenciaForm
			isEditing
			competenciaID={competenciaEditable.id}
			nombreCompetencia={competenciaEditable.nombre}
			selectedTipo={competenciaEditable.id_tipo}
		/>
	</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="heading">Competencias</h2>
	<span class="flex gap-8 items-center">
		<button class="link primary" on:click={cursosModal.openModal}
			>Gestionar tipos de competencias</button
		>
		<button
			class="btn primary"
			on:click={agregarCompetenciaModal.openModal}
			>Agregar competencias
		</button>
	</span>
</header>

<hr class="my-4 border-none" />

{#if $listaCompetencias.length == 0}
	<p>No hay competencias aún.</p>
{:else}
	<table
		id="table-diplomados"
		class="table-fixed table shadow-lg w-full"
	>
		<thead>
			<tr>
				<th>Competencia</th>
				<th>Tipo</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="">
			{#each $listaCompetencias as competencia (competencia.id)}
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
									competenciaEditableID = competencia.id;
									editarCOmpetenciaModal.openModal();
								}}>Editar competencia</button
							>
							<button
								class="link"
								on:click={() =>
									competencias.removeItem(competencia.id)}
								>Eliminar competencia</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
