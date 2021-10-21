<script lang="ts">
	import DiplomadoForm from '$lib/components/coordinador/diplomadoForm.svelte';
	import GestionCursos from '$lib/components/coordinador/gestionCursos.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { cursos } from '$lib/stores/db/cursos';
	import { diplomados } from '$lib/stores/db/diplomados';
	import { diplomadosList } from '$lib/stores/lists/diplomadosList';
	import { useModal } from '$lib/stores/modal';
	import { derived } from 'svelte/store';

	let agregarDiplomadoModal = useModal();
	let editarDiplomadoModal = useModal();

	let diplomadoEditableID: number;
	$: diplomadoEditable = $diplomadosList.find(
		(d) => d.id == diplomadoEditableID
	);
	let cursosModal = useModal();
</script>

{#if $agregarDiplomadoModal}
	<Modal handleClose={agregarDiplomadoModal.closeModal}>
		<DiplomadoForm />
	</Modal>
{/if}

{#if $cursosModal}
	<Modal handleClose={cursosModal.closeModal}>
		<GestionCursos />
	</Modal>
{/if}

{#if $editarDiplomadoModal}
	<Modal handleClose={editarDiplomadoModal.closeModal}>
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
	<h2 class="heading">Diplomados</h2>
	<span class="flex gap-8 items-center">
		<button class="link primary" on:click={cursosModal.openModal}
			>Gestionar cursos</button
		>
		<button
			class="btn primary"
			on:click={agregarDiplomadoModal.openModal}
			>Agregar diplomado
		</button>
	</span>
</header>

<hr class="my-4 border-none" />

{#if $diplomadosList.length == 0}
	<p>No hay diplomados aún.</p>
{:else}
	<table
		id="table-diplomados"
		class="table-fixed table shadow-lg w-full"
	>
		<thead>
			<tr>
				<th>Diplomado</th>
				<th>Cursos</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="">
			{#each $diplomadosList as diplomado (diplomado.id)}
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
									editarDiplomadoModal.openModal();
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
