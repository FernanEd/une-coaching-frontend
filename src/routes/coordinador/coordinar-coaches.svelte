<script lang="ts">
	import GestionDocentesEnCoaches from '$lib/components/coordinador/gestionDocentesEnCoaches.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { useModal } from '$lib/stores/modal';
	import { usuarioList } from '$lib/stores/lists/usuariosList';
	import { coachList } from '$lib/stores/lists/coachList';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';

	let gestionarDocentes = useModal();
	let filterText: string;

	let currentCoachID: number;
	$: currentCoach = $coachList.find(
		(coach) => coach.id_coach == currentCoachID
	);
</script>

{#if $gestionarDocentes}
	<Modal handleClose={gestionarDocentes.closeModal}
		><GestionDocentesEnCoaches
			coachID={currentCoach.id_coach}
			docentesEnCoach={currentCoach.docentes}
			docentesSeleccionados={currentCoach.docentes.map(
				(docente) => docente.id_docente
			)}
		/></Modal
	>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="text-2xl font-bold">Coordinación de Coaches</h2>

	<label>
		<p class="leyenda text-text-4 text-xs">Buscar usuario</p>
		<input type="text" bind:value={filterText} />
	</label>
</header>

<hr class="my-4 border-none" />

<table id="table" class="table-fixed shadow-lg w-full">
	<thead>
		<tr>
			<th>Coach</th>
			<th>Docentes asignados</th>
			<th>...</th>
		</tr>
	</thead>
	<tbody class="">
		{#each makeArraySearchable($coachList, ['nombre', 'apellido_paterno', 'apellido_materno'], filterText) as coach (coach.id)}
			<tr>
				<td>
					<p>
						{coach.nombre}
						{coach.apellido_paterno}
						{coach.apellido_materno}
					</p>
				</td>
				<td>
					{#if coach.docentes.length == 0}
						<p class="text text-text-4">Sin docentes asignados</p>
					{:else}
						<p>{coach.docentes.length} docentes asignados</p>
						{#each coach.docentes as docente (docente.id)}
							<p>
								{docente.nombre}
								{docente.apellido_paterno}
								{docente.apellido_materno}
							</p>
						{/each}
					{/if}
				</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button
							class="link primary"
							on:click={() => {
								gestionarDocentes.openModal();
								currentCoachID = coach.id_coach;
							}}>Gestionar docentes</button
						>
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
