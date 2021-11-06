<script lang="ts">
	import Modal from '$lib/components/modal.svelte';
	import { currentUser } from '$lib/stores/currentUser';

	import { competencias } from '$lib/stores/db/competencias';
	import { diplomados } from '$lib/stores/db/diplomados';
	import { tiposCompetencias } from '$lib/stores/db/tipoCompetencias';
	import {
		DocentePortal,
		getDocentePortal
	} from '$lib/stores/docentePortal';
	import { diplomadosList } from '$lib/stores/lists/diplomadosList';
	import { useModal } from '$lib/stores/modal';
	import type { Readable } from 'svelte/store';

	let cursosDeDiplomadoModal = useModal();
	let currentDiplomadoID: number;

	let docente: Readable<DocentePortal>;
	$: docente = getDocentePortal($currentUser?.id);

	$: tiposPorCompetencias = $tiposCompetencias.map((t) => ({
		...t,
		competencias: $competencias.filter((c) => c.id_tipo == t.id)
	}));

	$: currentDiplomado = $diplomadosList.find(
		(d) => d.id == currentDiplomadoID
	);
</script>

{#if $cursosDeDiplomadoModal}
	<Modal handleClose={cursosDeDiplomadoModal.closeModal}>
		<header class="w-screen max-w-sm">
			<h2 class="heading">Cursos de {currentDiplomado.nombre}</h2>

			<section class="flex flex-col gap-8 mt-8">
				{#each currentDiplomado.listaCursos as curso (curso.id)}
					<article
						class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"
					>
						<div>
							<p>{curso.nombre}</p>
							<p class="label">
								{$docente.acreditaciones?.cursos?.find(
									(r) => r.id_curso == curso.id
								)
									? 'Completado'
									: 'No completado'}
							</p>
						</div>
					</article>
				{/each}
			</section>
		</header>
	</Modal>
{/if}

{#if $docente}
	<h2 class="heading">Diplomados</h2>
	{#if $diplomados.length == 0}
		<p>No hay diplomados aun</p>
	{:else}
		<p class="label">
			{$docente?.acreditaciones.diplomados.filter((r) => r.documento)
				.length} de {$diplomados.length} completados
		</p>
		<section class="flex flex-col gap-8 mt-4 mb-8">
			{#each $diplomadosList as diplomado (diplomado.id)}
				<article
					class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"
				>
					<div>
						<p>{diplomado.nombre}</p>
						<p class="label">
							{$docente?.acreditaciones?.cursos?.filter(
								(r) => r.curso.id_diplomado == diplomado.id
							).length || 0} de {diplomado.listaCursos.length} cursos completados
						</p>
					</div>

					<div class="flex gap-8 justify-center">
						<button
							class="link primary"
							on:click={() => {
								currentDiplomadoID = diplomado.id;
								cursosDeDiplomadoModal.openModal();
							}}>Ver cursos</button
						>
						<!-- <button class="link">Descargar documento</button> -->
					</div>
				</article>
			{/each}
		</section>
	{/if}

	{#each tiposPorCompetencias as tipoPorCompetencia (tipoPorCompetencia.id)}
		{#if tipoPorCompetencia.competencias.length > 0}
			<hr class="border-none py-4" />

			<h2 class="heading">
				Competencias tipo {tipoPorCompetencia.nombre}
			</h2>
			<p class="label">
				{$docente?.acreditaciones?.competencias?.filter(
					(r) => r.competencia.tipo.id == tipoPorCompetencia.id
				).length} de {tipoPorCompetencia.competencias.length} completados
			</p>
			<section class="flex flex-col gap-8 mt-4 mb-8">
				{#each tipoPorCompetencia.competencias as competencia (competencia.id)}
					<article
						class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"
					>
						<div>
							<p>{competencia.nombre}</p>
							<p class="label">
								{$docente.acreditaciones?.competencias?.find(
									(r) => r.id_competencia == competencia.id
								)
									? 'Completado'
									: 'No completado'}
							</p>
						</div>
					</article>
				{/each}
			</section>
		{/if}
	{/each}
{/if}
