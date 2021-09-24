<script lang="ts">
	import Modal from '$lib/components/modal.svelte';
	import { useModal } from '$lib/stores/modal';

	let filterText: string;
	let jornadaModal = useModal();

	const handleFilterField = () => {
		console.log(filterText);
	};
</script>

{#if $jornadaModal}
	<Modal handleClose={jornadaModal.closeModal}>Joder</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="text-2xl font-bold">Diplomados y competencias</h2>
	<span class="flex gap-8 items-center">
		<button
			class="px-4 py-2 bg-accent 
  rounded-full shadow-xl 
  font-bold text-text-inv"
			>Agregar diplomado
		</button>
	</span>
</header>

<hr class="my-4 border-none" />

<label />
<p class="leyenda text-text-4 text-xs">Ver tabla</p>
<div class="flex gap-4">
	<button
		on:click={jornadaModal.openModal}
		class="font-bold text-accent">Diplomados</button
	>
	/
	<button
		on:click={jornadaModal.openModal}
		class="font-bold text-text-4">Cursos</button
	>
	/
	<button
		on:click={jornadaModal.openModal}
		class="font-bold text-text-4">Competencias</button
	>
</div>

<hr class="my-4 border-none" />

<table id="table" class="table-fixed table shadow-lg w-full">
	<thead>
		<tr>
			<th>Diplomado</th>
			<th>Cursos</th>
			<th>...</th>
		</tr>
	</thead>
	<tbody class="">
		{#each [...Array(20).fill(0)] as i}
			<tr>
				<td
					>Diplomado en didáctica de las competencias de nivel
					superior</td
				>
				<td>
					{#each [...Array((1 + Math.random() * 5) | 0).fill('174819')] as s}
						Introducción al Modelo Educativo y Constructivismo,{' '}
					{/each}
				</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button class="font-bold text-accent"
							>Gestionar cursos</button
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
