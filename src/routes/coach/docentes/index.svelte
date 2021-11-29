<script lang="ts">
	import { session } from '$app/stores';

	import { coachesComoUsuarios } from '$lib/stores/lists/coachesComoUsuario';
	import { docentesComoUsuarios } from '$lib/stores/lists/docentesComoUsuario';
	import type { DocenteComoUsuario } from '$lib/stores/lists/docentesComoUsuario';
	import { useModal } from '$lib/stores/useModal';
	import type { Readable } from 'svelte/store';
	import { derived } from 'svelte/store';
	import { db_docentesEnCoaches } from '$lib/stores/db';
	import AcreditacionesDocente from '$lib/components/acreditaciones/acreditacionesDocente.svelte';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';

	let docenteAcreditacionesDetalles = useModal();
	let currentDocenteUsuarioID: number;

	let coachID: number | undefined;
	$: coachID = $coachesComoUsuarios.find(
		(c) => c.id == $session.user.id
	)?.id_coach;

	let docentes: Readable<DocenteComoUsuario[]> | undefined;
	$: docentes = coachID
		? derived(
				[docentesComoUsuarios, db_docentesEnCoaches],
				([docentes, asignaciones]) => {
					let docentesAsignados = asignaciones.filter(
						(a) => a.id_coach == coachID
					);

					return docentesAsignados
						.map((d) => {
							let docente = docentes.find(
								(docente) => docente.id_docente == d.id_docente
							);
							if (!docente) return;

							return docente;
						})
						.filter((d): d is DocenteComoUsuario => d != undefined);
				}
		  )
		: undefined;

	let filterText = '';
</script>

{#if $docenteAcreditacionesDetalles}
	<button class="link mb-4" on:click={docenteAcreditacionesDetalles.closeModal}
		>← Volver atrás</button
	>
	<AcreditacionesDocente docenteID={currentDocenteUsuarioID} />
{:else if docentes && $docentes}
	<h2 class="heading">Docentes ({$docentes.length})</h2>
	<hr class="my-2 border-none" />

	<p class="label">Busca un docente en particular</p>
	<input type="text" class="w-full" bind:value={filterText} />

	<hr class="my-2 border-none" />

	{#if $docentes.length == 0}
		<p>No tienes docentes asignados aún.</p>
	{:else}
		<section class="flex flex-col gap-8">
			{#each makeArraySearchable($docentes, ['nombre', 'apellido_paterno', 'apellido_materno'], filterText) as docente (docente.id)}
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

					<button
						class="link primary"
						on:click={() => {
							currentDocenteUsuarioID = docente.id_docente;
							docenteAcreditacionesDetalles.openModal();
						}}>Ver acreditaciones</button
					>
				</article>
			{/each}
		</section>
	{/if}
{/if}
