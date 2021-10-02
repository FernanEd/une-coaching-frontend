<script lang="ts">
	import GestionDocentes from '$lib/components/coordinador/gestionDocentes.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { coachList } from '$lib/stores/coachList';
	import {
		coaches,
		docentes,
		docentesEnCoaches
	} from '$lib/stores/db';
	import { useModal } from '$lib/stores/modal';
	import { usuarioList } from '$lib/stores/usuariosList';

	let gestionarDocentes = useModal();
	let filterText: string;
	let filterFunction;

	const handleFilterField = () => {
		console.log(filterText);
	};
</script>

{#if $gestionarDocentes}
	<Modal handleClose={gestionarDocentes.closeModal}
		><GestionDocentesEnCoaches /></Modal
	>
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
		{#each $coachList as coach (coach.id)}
			<tr>
				<td>
					<a href="#">{coach.matricula}</a>
					<p>
						{coach.nombre}
						{coach.apellido_paterno}
						{coach.apellido_materno}
					</p>
				</td>
				<td>
					{#each $docentesEnCoaches as docente (docente.id)}
						<a href="#"
							>{coach.docentes
								.map((docente) => docente.matricula)
								.join(',')}</a
						>,{' '}
					{/each}
				</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button
							class="link primary"
							on:click={gestionarDocentes.openModal}
							>Gestionar docentes</button
						>
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
