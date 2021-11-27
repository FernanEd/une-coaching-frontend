<script lang="ts">
	import { coachesConDocentes } from '$lib/stores/lists/coachesConDocentes';

	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';

	// let gestionarDocentes = useModal();
	let filterText: string;

	// let docentesAsignadosModal = useModal();
	// let listaDocentesAsignados: DocenteComoUsuario[] = [];

	// let currentCoachID: number;
	// $: currentCoach = $coachList.find(
	// 	(coach) => coach.id_coach == currentCoachID
	// );
</script>

<!-- {#if $gestionarDocentes}
	<Modal handleClose={gestionarDocentes.closeModal}
		><GestionDocentesEnCoaches
			coachUserID={currentCoach.id}
			coachID={currentCoach.id_coach}
			docentesEnCoach={currentCoach.docentes}
			docentesSeleccionados={currentCoach.docentes.map(
				(docente) => docente.id_docente
			)}
		/></Modal
	>
{/if}

{#if $docentesAsignadosModal}
	<Modal handleClose={docentesAsignadosModal.closeModal}>
		<ListaDocentesAsignados docentes={listaDocentesAsignados} />
	</Modal>
{/if} -->

<h2 class="text-2xl font-bold">Coordinación de Coaches</h2>

<hr class="my-4 border-none" />

<p class="leyenda text-text-4 text-xs">Buscar coach</p>
<input type="text" bind:value={filterText} />

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
		{#each makeArraySearchable($coachesConDocentes, ['nombre', 'apellido_paterno', 'apellido_materno'], filterText) as coach (coach.id)}
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
						<p>
							{coach.docentes.length == 1
								? `${coach.docentes.length} docente asignado`
								: `${coach.docentes.length} docentes asignados`}
						</p>
						<button
							class="link primary"
							on:click={() => {
								// docentesAsignadosModal.openModal();
								// listaDocentesAsignados = coach.docentes;
							}}>Ver docentes asignados</button
						>
					{/if}
				</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button
							class="link primary"
							on:click={() => {
								// gestionarDocentes.openModal();
								// currentCoachID = coach.id_coach;
							}}>Gestionar docentes</button
						>
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
