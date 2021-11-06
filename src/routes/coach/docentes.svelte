<script lang="ts">
	import AcreditacionesDocente from '$lib/components/coach/acreditacionesDocente.svelte';
	import { currentUser } from '$lib/stores/currentUser';
	import { coachList } from '$lib/stores/lists/coachList';
	import { useModal } from '$lib/stores/modal';

	let docenteAcreditacionesDetalles = useModal();
	let currentDocenteUsuarioID: number;

	$: currentCoach = $coachList.find((d) => d.id == $currentUser?.id);
</script>

{#if $docenteAcreditacionesDetalles}
	<button
		class="link mb-4"
		on:click={docenteAcreditacionesDetalles.closeModal}
		>← Volver atrás</button
	>
	<AcreditacionesDocente docenteUsuarioID={currentDocenteUsuarioID} />
{:else}
	<h2 class="heading">Docentes ({currentCoach.docentes.length})</h2>

	<hr class="my-2 border-none" />

	{#if currentCoach.docentes.length == 0}
		<p>No tienes docentes asignados aún.</p>
	{:else}
		<section class="flex flex-col gap-8">
			{#each currentCoach.docentes as docente (docente.id)}
				<article
					class="flex flex-col p-4 gap-8 text-center rounded-2xl shadow-fix items-center"
				>
					<div>
						<p class="label">Matricula: {docente.matricula}</p>
						<p>
							{docente.nombre}
							{docente.apellido_paterno}
							{docente.apellido_materno}
						</p>
						<p>{docente.correo}</p>
					</div>

					<div>
						<p class="label">Resumen de estado</p>
						<p>x de x diplomados</p>
						<p>x de x competencias basicas</p>
						<p>x de x competencias adicionales</p>
					</div>

					<button
						class="link primary"
						on:click={() => {
							currentDocenteUsuarioID = docente.id;
							docenteAcreditacionesDetalles.openModal();
						}}>Ver acreditaciones</button
					>
				</article>
			{/each}
		</section>
	{/if}
{/if}
