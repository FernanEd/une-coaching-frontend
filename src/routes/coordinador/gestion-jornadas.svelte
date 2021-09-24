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
	<h2 class="text-2xl font-bold">Jornadas</h2>
	<span class="flex gap-8 items-center">
		<button
			on:click={jornadaModal.openModal}
			class="font-bold text-accent">Seleccionar jornada</button
		>
		<button
			class="px-4 py-2 bg-accent 
  rounded-full shadow-xl 
  font-bold text-text-inv"
			>Agregar curso
		</button>
	</span>
</header>

<hr class="my-4 border-none" />

<table id="table" class="table-fixed table shadow-lg w-full">
	<thead>
		<tr>
			<th>Curso</th>
			<th>Instructor del curso</th>
			<th>Participantes</th>
			<th>...</th>
		</tr>
	</thead>
	<tbody class="">
		{#each [...Array(20).fill(0)] as i}
			<tr>
				<td>Aplicación de tecnicas docente II</td>
				<td>Fernando Edmundo Balderas Morán</td>
				<td>
					<p>
						Cupos restantes: <span class="font-bold"
							>{(1 + Math.random() * 6) | 0}</span
						>
					</p>
					<p>Inscritos:</p>
					{#each [...Array((Math.random() * 20) | 0).fill('174819')] as s}
						<a href="#">{s}</a>,{' '}
					{/each}
				</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button class="font-bold text-accent">Editar curso</button
						>
						<button class="font-bold text-text-4"
							>Eliminar curso</button
						>
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
