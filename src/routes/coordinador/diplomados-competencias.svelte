<script lang="ts">
	import FormularioAgregarDiplomado from '$lib/components/coordinador/formularioAgregarDiplomado.svelte';
	import GestionCursos from '$lib/components/coordinador/gestionCursos.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { diplomados } from '$lib/stores/diplomados';
	import { useModal } from '$lib/stores/modal';
	import { onMount } from 'svelte';

	let agregarDiplomadoModal = useModal();
	let editarDiplomadoModal = useModal();

	onMount(() => {
		if ($diplomados.length == 0) {
			diplomados.getItems();
		}
	});

	let filterText: string;
	let cursosModal = useModal();

	let showingTable: 'diplomados' | 'competencias' = 'diplomados';

	const handleFilterField = () => {
		console.log(filterText);
	};
</script>

{#if $agregarDiplomadoModal}
	<Modal handleClose={agregarDiplomadoModal.closeModal}>
		<FormularioAgregarDiplomado />
	</Modal>
{/if}

{#if $cursosModal}
	<Modal handleClose={cursosModal.closeModal}>
		<GestionCursos />
	</Modal>
{/if}

<!-- {#if $editarDiplomadoModal}
	<Modal handleClose={editarDiplomadoModal.closeModal} />
{/if} -->

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
			{#each $diplomados as diplomado (diplomado.id)}
				<tr>
					<td>{diplomado.nombre}</td>
					<td>
						{#each [...Array((1 + Math.random() * 5) | 0).fill('174819')] as s}
							Introducción al Modelo Educativo y Constructivismo,{' '}
						{/each}
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button class="link primary">Editar diplomado</button>
							<button class="link">Eliminar diplomado</button>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
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
			{#each $diplomados as diplomado (diplomado.id)}
				<tr>
					<td>{diplomado.nombre}</td>
					<td>
						{#each [...Array((1 + Math.random() * 5) | 0).fill('174819')] as s}
							Introducción al Modelo Educativo y Constructivismo,{' '}
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
			{/each}
		</tbody>
	</table>
{/if}
