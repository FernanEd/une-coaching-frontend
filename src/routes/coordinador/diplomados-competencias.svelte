<script lang="ts">
	import DiplomadoForm from '$lib/components/coordinador/diplomadoForm.svelte';
	import GestionCursos from '$lib/components/coordinador/gestionCursos.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { cursos, diplomados } from '$lib/stores/db';
	import { useModal } from '$lib/stores/modal';
	import { derived } from 'svelte/store';

	let agregarDiplomadoModal = useModal();
	let editarDiplomadoModal = useModal();
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
	let diplomadoEditable;
	let cursosModal = useModal();
	let showingTable: 'diplomados' | 'competencias' = 'diplomados';
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
	<h2 class="heading">Diplomados y competencias</h2>
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

<p class="label">Ver tabla</p>
<div class="flex gap-4">
	<button
		on:click={() => (showingTable = 'diplomados')}
		class:primary={showingTable == 'diplomados'}
		class="link">Diplomados</button
	>
	/
	<button
		on:click={() => (showingTable = 'competencias')}
		class:primary={showingTable == 'competencias'}
		class="link">Competencias</button
	>
</div>

<hr class="my-4 border-none" />

{#if showingTable == 'diplomados'}
	{#if $listaDiplomados.length == 0}
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
				{#each $listaDiplomados as diplomado (diplomado.id)}
					<tr>
						<td>{diplomado.nombre}</td>
						<td>
							{#if diplomado.listaCursos.length > 0}
								{diplomado.listaCursos
									.map((c) => c.nombre)
									.join(', ')}
							{:else}
								<p class="text text-text-4">Sin cursos</p>
							{/if}
						</td>
						<td>
							<span class="flex gap-8 justify-center">
								<button
									class="link primary"
									on:click={() => {
										diplomadoEditable = diplomado;
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
{:else}
	<table
		id="table-competencias"
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
			<!-- {#each $diplomados as diplomado (diplomado.id)}
				<tr>
					<td>{diplomado.id} - sex {diplomado.nombre}</td>
					<td>
						{#each $cursos.filter((curso) => curso.id_diplomado == diplomado.id) as curso (curso.id)}
							{curso.nombre},{' '}
						{/each}
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button class="font-bold text-accent"
								>Editar diplomado</button
							>
							<button class="font-bold text-text-4"
								>Eliminar diplomado</button
							>
						</span>
					</td>
				</tr>
			{/each} -->
		</tbody>
	</table>
{/if}
