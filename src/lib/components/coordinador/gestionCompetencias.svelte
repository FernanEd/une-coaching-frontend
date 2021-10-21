<script lang="ts">
	import DiplomadoForm from '$lib/components/coordinador/diplomadoForm.svelte';
	import GestionCursos from '$lib/components/coordinador/gestionCursos.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { cursos } from '$lib/stores/db/cursos';
	import { diplomados } from '$lib/stores/db/diplomados';
	import { useModal } from '$lib/stores/modal';
	import { derived } from 'svelte/store';

	let agregarCompetenciaModal = useModal();
	let editarCOmpetenciaModal = useModal();
	let listaDiplomados = derived(
		[diplomados, cursos],
		([$diplomados, $cursos]) =>
			$diplomados.map((d) => ({
				...d,
				listaCursos: $cursos.filter(
					({ id_diplomado }) => id_diplomado == d.id
				)
			}))
	);

	let diplomadoEditableID: number;
	$: diplomadoEditable = $listaDiplomados.find(
		(d) => d.id == diplomadoEditableID
	);
	let cursosModal = useModal();
</script>

{#if $agregarCompetenciaModal}
	<Modal handleClose={agregarCompetenciaModal.closeModal}>
		<DiplomadoForm />
	</Modal>
{/if}

{#if $cursosModal}
	<Modal handleClose={cursosModal.closeModal}>
		<GestionCursos />
	</Modal>
{/if}

{#if $editarCOmpetenciaModal}
	<Modal handleClose={editarCOmpetenciaModal.closeModal}>
		<DiplomadoForm
			isEditing
			diplomadoID={diplomadoEditable.id}
			nombreDiplomado={diplomadoEditable.nombre}
			cursosSeleccionados={diplomadoEditable.listaCursos.map(
				(c) => c.id
			)}
		/>
	</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="heading">Competencias</h2>
	<span class="flex gap-8 items-center">
		<button class="link primary" on:click={cursosModal.openModal}
			>Gestionar tipos</button
		>
		<button
			class="btn primary"
			on:click={agregarCompetenciaModal.openModal}
			>Agregar competencias
		</button>
	</span>
</header>

<hr class="my-4 border-none" />

{#if $listaDiplomados.length == 0}
	<p>No hay diplomados aún.</p>
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
			{#each $listaDiplomados as diplomado (diplomado.id)}
				<tr>
					<td>{diplomado.nombre}</td>
					<td>
						{#if diplomado.listaCursos.length > 0}
							{diplomado.listaCursos.map((c) => c.nombre).join(', ')}
						{:else}
							<p class="text text-text-4">Sin cursos</p>
						{/if}
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="link primary"
								on:click={() => {
									diplomadoEditableID = diplomado.id;
									editarCOmpetenciaModal.openModal();
								}}>Editar diplomado</button
							>
							<button
								class="link"
								on:click={() => diplomados.removeItem(diplomado.id)}
								>Eliminar diplomado</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
