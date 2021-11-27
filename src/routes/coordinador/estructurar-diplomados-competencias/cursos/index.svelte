<script lang="ts">
	import Modal from '$lib/components/common/modal.svelte';
	import { db_cursos } from '$lib/stores/db';
	import {
		CursoConDiplomado,
		cursosConDiplomado,
	} from '$lib/stores/lists/cursosConDiplomado';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toasts';
	import { useModal } from '$lib/stores/useModal';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';
	import CursoForm from './_modules/cursoForm.svelte';
	import GestionDiplomados from './_modules/gestionDiplomados.svelte';

	let agregarCursoModal = useModal();
	let editarCursoModal = useModal();

	let gestionarTiposCompetenciaModal = useModal();

	let editingCursoID: number | undefined;
	let editingCurso: CursoConDiplomado | undefined;
	$: editingCurso = $cursosConDiplomado.find((c) => c.id == editingCursoID);

	let filterText: string;
</script>

{#if $agregarCursoModal}
	<Modal handleClose={agregarCursoModal.closeModal}>
		<CursoForm />
	</Modal>
{/if}

{#if $editarCursoModal}
	<Modal handleClose={editarCursoModal.closeModal}>
		<CursoForm
			editingCursoID={editingCurso?.id}
			form={{
				nombre: editingCurso?.nombre,
				id_diplomado: editingCurso?.id_diplomado,
			}}
			selectedDiplomadoID={editingCurso?.id_diplomado}
		/>
	</Modal>
{/if}

{#if $gestionarTiposCompetenciaModal}
	<Modal handleClose={gestionarTiposCompetenciaModal.closeModal}>
		<GestionDiplomados />
	</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="heading">Tabla de Cursos</h2>
	<span class="flex gap-8 items-center">
		<button
			class="link primary"
			on:click={gestionarTiposCompetenciaModal.openModal}
			>Gestionar Diplomados</button
		>
		<button class="btn primary" on:click={agregarCursoModal.openModal}
			>Agregar cursos
		</button>
	</span>
</header>

<hr class="my-4 border-none" />

<p class="label">Buscar un curso</p>
<input type="text" bind:value={filterText} />

<hr class="my-4 border-none" />

{#if $cursosConDiplomado.length == 0}
	<p>No hay competencias aún.</p>
{:else}
	<table id="table-diplomados" class="table-fixed table shadow-lg w-full">
		<thead>
			<tr>
				<th>Curso</th>
				<th>Diplomado al que pertenece</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="">
			{#each makeArraySearchable($cursosConDiplomado, ['nombre'], filterText) as curso (curso.id)}
				<tr>
					<td>{curso.nombre}</td>
					<td>
						{#if curso.diplomado}
							{curso.diplomado.nombre}
						{:else}
							<p class="text text-text-4">
								Este curso no pertenece a ningún diplomado
							</p>
						{/if}
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="link primary"
								on:click={() => {
									editingCursoID = curso.id;
									editarCursoModal.openModal();
								}}>Editar curso</button
							>
							<button
								class="link"
								on:click={() =>
									prompts.showPrompt({
										type: 'danger',
										message:
											'¿Estás seguro que quieres borrar este curso? Si la borras todos los registros creados de esta curso se perderán.',
										onAccept: async () => {
											try {
												await db_cursos.deleteItem(curso.id);
												toasts.success();
											} catch (e) {
												console.error(e);
												toasts.error();
											}
										},
									})}>Eliminar curso</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
