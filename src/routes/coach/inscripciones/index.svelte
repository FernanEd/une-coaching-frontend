<!-- <script lang="ts">
	
	$: jornada = seleccionarJornada($currentJornada?.id);
	$: cursosDeLaJornada = $jornada?.cursos?.filter((c) => c?.estado == 0) || [];

	let inscribirModal = useModal();
	let currentCursoEnJornadaID: number;

	$: currentCursoEnJornada = derived(jornada, ($jornada) => {
		if (!$jornada) return;
		if ($jornada.cursos.length == 0) return;

		return $jornada?.cursos?.find((c) => c?.id == currentCursoEnJornadaID);
	});
</script>

{#if $inscribirModal}
	<Modal handleClose={inscribirModal.closeModal}>
		<InscripcionDocentes
			cursoJornadaID={$currentCursoEnJornada.id}
			docentesSeleccionados={$currentCursoEnJornada.asistentes.map(
				(a) => a.id_docente
			)}
			asistenteEnCurso={$currentCursoEnJornada.asistentes}
			cupoCurso={$currentCursoEnJornada.cupo_maximo}
		/>
	</Modal>
{/if}

{#if $jornada}
	<h2 class="heading">
		{$jornada.titulo}
	</h2>

	{#if cursosDeLaJornada.length == 0}
		<p>No hay cursos en esta jornada aun...</p>
	{:else}
		<section class="flex flex-col gap-8 mt-4">
			{#each cursosDeLaJornada as cursoEnJornada (cursoEnJornada.id)}
				<article
					class="flex flex-col gap-4 rounded-2xl shadow-fix text-center p-4"
				>
					<div>
						<p class="label">
							{$diplomados.find(
								(d) => d.id == cursoEnJornada?.curso?.id_diplomado
							)?.nombre || 'Sin diplomado'}
						</p>
						<p>{cursoEnJornada?.curso?.nombre}</p>
					</div>

					<div>
						<p class="label">Instructor</p>
						<p>
							{cursoEnJornada.instructor.nombre}
							{cursoEnJornada.instructor.apellido_paterno}
							{cursoEnJornada.instructor.apellido_materno}
						</p>
					</div>

					<div>
						<p class="label">Cupo: {cursoEnJornada.cupo_maximo}</p>
						<p>
							{cursoEnJornada.cupo_maximo - cursoEnJornada.asistentes.length} restantes
						</p>
					</div>

					<button
						class="link primary"
						on:click={() => {
							currentCursoEnJornadaID = cursoEnJornada.id;
							inscribirModal.openModal();
						}}>Inscribir docentes</button
					>
				</article>
			{/each}
		</section>
	{/if}
{:else}
	No hay jornada activa
{/if} -->
