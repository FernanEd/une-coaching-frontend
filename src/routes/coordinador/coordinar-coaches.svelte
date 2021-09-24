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
	<h2 class="text-2xl font-bold">Coordinación de Coaches</h2>

	<label>
		<p class="leyenda text-text-4 text-xs">
			Buscar usuario por matricula
		</p>
		<input
			type="text"
			bind:value={filterText}
			on:input={handleFilterField}
		/>
	</label>
</header>

<hr class="my-4 border-none" />

<table id="table" class="table-fixed shadow-lg w-full">
	<thead>
		<tr>
			<th>Coach</th>
			<th>Coachees asignados</th>
			<th>...</th>
		</tr>
	</thead>
	<tbody class="">
		{#each [...Array(20).fill(0)] as i}
			<tr>
				<td>
					<a href="#">174819</a>
					<p>Fernando Edmundo Balderas Morán</p>
				</td>
				<td>
					{#each [...Array((Math.random() * 20) | 0).fill('174819')] as s}
						<a href="#">{s}</a>,{' '}
					{/each}
				</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button class="font-bold text-accent"
							>Gestionar coachees</button
						>
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
