<!-- <button
	on:click={() =>
		db_cursosEnJornada.addItem({
			cupo_maximo: 2,
			estado: 0,
			id_curso: 43,
			id_instructor: 24,
			id_jornada: 1,
		})}
>
	Crear curso
</button>

{$db_cursos[0].id}
{$db_instructores[0].id}
{$db_jornadas[0].id} -->
<script lang="ts">
	import {
		db_cursos,
		db_cursosEnJornada,
		db_instructores,
		db_jornadas,
	} from '$lib/stores/db';

	import { cursosEnJornadaConInstructorConCurso } from '$lib/stores/lists/jornada/cursosEnJornadaConInstructorConCurso';
	import { useModal } from '$lib/stores/useModal';
	import type { Jornada } from '$lib/utils/types/db';
	import { jornadaSeleccionada } from './_modules/jornadaSeleccionada';

	let currentJornadaID: number | undefined;
	$: currentJornadaID = $jornadaSeleccionada;
	let currentJornada: Jornada | undefined;
	$: currentJornada = $db_jornadas.find((j) => j.id == currentJornadaID);

	let gestionJornadasModal = useModal();
	let agregarcursoJornadaModal = useModal();
	let editarcursoJornadaModal = useModal();
</script>

<!-- <script lang="ts">
	let jornadaModal = useModal();
	let addCursoModal = useModal();
	let updateCursoModal = useModal();

	let asistentesModal = useModal();
	let listaAsistentes: AsistenteDeCurso[] = [];

	let jornadaSeleccionada: number;
	onMount(() => {
		let unsubscribe = store_jornadaSeleccionada.subscribe((val) => {
			jornadaSeleccionada = val;
		});

		return unsubscribe;
	});

	let currentJornada: Readable<JornadaConCursos> | undefined;
	$: currentJornada = seleccionarJornada(jornadaSeleccionada);

	let currentCursoID: number;
	$: currentCurso = $cursosEnJornada.find((c) => c.id == currentCursoID);
</script>

{#if $jornadaModal}
	<Modal handleClose={jornadaModal.closeModal}><GestionJornadas /></Modal>
{/if}

{#if $addCursoModal}
	<Modal handleClose={addCursoModal.closeModal}>
		<CursoJornadaForm currentjornadaID={$currentJornada.id} />
	</Modal>
{/if}

{#if $updateCursoModal}
	<Modal handleClose={updateCursoModal.closeModal}>
		<CursoJornadaForm
			currentjornadaID={$currentJornada.id}
			isEditing
			currentCursoID={currentCurso.id}
			cupoCurso={currentCurso.cupo_maximo}
			cursoSeleccionado={currentCurso.id_curso}
			instructorSeleccionado={currentCurso.id_instructor}
			cursoEstado={currentCurso.estado}
		/>
	</Modal>
{/if}

{#if $asistentesModal}
	<Modal handleClose={asistentesModal.closeModal}>
		<ListaAsistentes asistentes={listaAsistentes} />
	</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="heading">
		{#if $currentJornada}
			Jornada: {$currentJornada.titulo}
		{:else}
			Jornadas
		{/if}
	</h2>
	<span class="flex gap-8 items-center">
		<button on:click={jornadaModal.openModal} class="link primary"
			>Gestionar jornadas</button
		>
		{#if $currentJornada}
			<button class="btn primary" on:click={addCursoModal.openModal}
				>Agregar curso
			</button>
		{/if}
	</span>
</header>

<hr class="my-4 border-none" />

<p class="label">Selecciona una jornada</p>
<select bind:value={$store_jornadaSeleccionada}>
	<option selected disabled value="">Sin seleccionar</option>
	{#each $jornadas as jornada (jornada.id)}
		<option value={jornada.id}>{jornada.titulo}</option>
	{/each}
</select>

<hr class="my-4 border-none" />

{#if $currentJornada}
	<span class="flex gap-8">
		<div>
			<p class="label">Periodo de la jornada</p>
			<p>
				{dayjs($currentJornada.fecha_inicio).format(dateFormat)} - {dayjs(
					$currentJornada.fecha_fin
				).format(dateFormat)}
			</p>
		</div>
		<div>
			<p class="label">Periodo de inscripciones</p>
			<p>
				{dayjs($currentJornada.fecha_inscripcion_inicio).format(dateFormat)} - {dayjs(
					$currentJornada.fecha_inscripcion_fin
				).format(dateFormat)}
			</p>
		</div>
	</span>

	<hr class="my-4 border-none" />
{/if}

{#if !$currentJornada}
	<p>No hay jornada seleccionda aún</p>
{:else if $currentJornada.cursos.length == 0}
	<p class="text-text-4">No hay cursos en esta jornada aún, agrege uno.</p>
{:else}
	<table id="table" class="table-fixed table shadow-lg w-full">
		<thead>
			<tr>
				<th>Curso</th>
				<th>Estado</th>
				<th>Instructor del curso</th>
				<th>Participantes</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="">
			{#each $currentJornada.cursos as cursoJornada (cursoJornada.id)}
				<tr>
					<td>{cursoJornada.curso.nombre}</td>
					<td
						><p class:text-status-danger={cursoJornada.estado == 1}>
							{cursoJornada.estado == 0
								? 'En progreso'
								: cursoJornada.estado == 1
								? 'Cerrado'
								: '...'}
						</p>
					</td>
					<td>
						<p>
							{cursoJornada.instructor.nombre}
							{cursoJornada.instructor.apellido_paterno}
							{cursoJornada.instructor.apellido_materno}
						</p>
					</td>
					<td>
						<p>
							Inscritos: {cursoJornada.asistentes
								.length}/{cursoJornada.cupo_maximo}
						</p>
						<p>
							<button
								class="link primary"
								on:click={() => {
									asistentesModal.openModal();
									listaAsistentes = cursoJornada.asistentes;
								}}>Ver asistentes</button
							>
						</p>
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="font-bold text-accent"
								on:click={() => {
									currentCursoID = cursoJornada.id;
									updateCursoModal.openModal();
								}}>Editar curso</button
							>
							<button
								class="font-bold text-text-4"
								on:click={() =>
									prompts.showPrompt({
										type: 'danger',
										message:
											'¿Estás seguro que quieres borrar este curso? Si la borras todos los registros, diplomados creados de este curso se perderán.',
										onAccept: async () => {
											try {
												await cursosEnJornada.removeItem(cursoJornada.id);
												toasts.success();
											} catch (e) {
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
{/if} -->

<header class="flex justify-between flex-wrap">
	<h2 class="heading">
		{#if currentJornada}
			Jornada: {currentJornada.titulo}
		{:else}
			Jornadas
		{/if}
	</h2>
	<span class="flex gap-8 items-center">
		<button on:click={gestionJornadasModal.openModal} class="link primary"
			>Gestionar jornadas</button
		>
		{#if currentJornada}
			<button class="btn primary" on:click={agregarcursoJornadaModal.openModal}
				>Agregar curso
			</button>
		{/if}
	</span>
</header>

<hr class="my-4 border-none" />

<p class="label">Selecciona una jornada</p>
<select bind:value={$jornadaSeleccionada}>
	<option value={undefined} disabled>Sin seleccionar</option>
	{#each $db_jornadas as jornada (jornada.id)}
		<option value={jornada.id}>{jornada.titulo}</option>
	{/each}
</select>

<hr class="my-4 border-none" />

{#if !currentJornada}
	<p>No hay jornada seleccionada aún</p>
{:else}
	<table id="table" class="table-fixed table shadow-lg w-full">
		<thead>
			<tr>
				<th>Curso</th>
				<th>Estado</th>
				<th>Instructor del curso</th>
				<th>Participantes</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="">
			{#each $cursosEnJornadaConInstructorConCurso.filter((cJ) => cJ.id_jornada == currentJornadaID) as cursoJornada (cursoJornada.id)}
				<tr>
					<td>{cursoJornada.curso.nombre}</td>
					<td
						><p class:text-status-danger={cursoJornada.estado == 1}>
							{cursoJornada.estado == 0
								? 'En progreso'
								: cursoJornada.estado == 1
								? 'Cerrado'
								: '...'}
						</p>
					</td>
					<td>
						{#if cursoJornada.instructor}
							<p>
								{cursoJornada.instructor.nombre}
								{cursoJornada.instructor.apellido_paterno}
								{cursoJornada.instructor.apellido_materno}
							</p>
						{/if}
					</td>
					<td>
						<!-- <p>
						Inscritos: {cursoJornada.asistentes
							.length}/{cursoJornada.cupo_maximo}
					</p>
					<p>
						<button
							class="link primary"
							on:click={() => {
								asistentesModal.openModal();
								listaAsistentes = cursoJornada.asistentes;
							}}>Ver asistentes</button
						>
					</p> -->
					</td>
					<td>
						<!-- <span class="flex gap-8 justify-center">
						<button
							class="font-bold text-accent"
							on:click={() => {
								currentCursoID = cursoJornada.id;
								updateCursoModal.openModal();
							}}>Editar curso</button
						>
						<button
							class="font-bold text-text-4"
							on:click={() =>
								prompts.showPrompt({
									type: 'danger',
									message:
										'¿Estás seguro que quieres borrar este curso? Si la borras todos los registros, diplomados creados de este curso se perderán.',
									onAccept: async () => {
										try {
											await cursosEnJornada.removeItem(cursoJornada.id);
											toasts.success();
										} catch (e) {
											toasts.error();
										}
									},
								})}>Eliminar curso</button
						>
					</span> -->
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
