<script lang="ts">
	import { db_cursos, db_diplomados } from '$lib/stores/db';
	import { cursosConDiplomado } from '$lib/stores/lists/cursosConDiplomado';
	import type { CursoConDiplomado } from '$lib/stores/lists/cursosConDiplomado';
	import type { Acreditaciones } from '$lib/stores/lists/portal-docente/getAcreditacionesParaDocente';
	import { useModal } from '$lib/stores/useModal';
	import type { Curso, Diplomado } from '$lib/utils/types/db';
	interface DiplomadoConCursos extends Diplomado {
		cursos: CursoConDiplomado[];
	}

	export let acreditaciones: Acreditaciones;
	let diplomadosConCursos: DiplomadoConCursos[] | undefined;
	$: diplomadosConCursos = $db_diplomados.map((d) => ({
		...d,
		cursos: $cursosConDiplomado.filter((c) => c.id_diplomado == d.id),
	}));

	let diplomadoAcreditado;
	let cursoAcreditado;

	let cursosDeDiplomadoModal = useModal();
	let currentDiplomadoID: number | undefined;
	let currentDiplomado: DiplomadoConCursos | undefined;
	$: currentDiplomado = currentDiplomadoID
		? diplomadosConCursos?.find((d) => d.id == currentDiplomadoID)
		: undefined;

	let cursosSinDiplomado: Curso[] | undefined;
	$: cursosSinDiplomado = $db_cursos.filter((c) => !c.id_diplomado);
</script>

{#if $cursosDeDiplomadoModal && currentDiplomado}
	<button class="link mb-4" on:click={cursosDeDiplomadoModal.closeModal}
		>← Volver atrás</button
	>

	<header class="w-screen max-w-sm">
		<h2 class="heading">Cursos de {currentDiplomado.nombre}</h2>

		<section class="flex flex-col gap-8 mt-8">
			{#each currentDiplomado.cursos as curso (curso.id)}
				<article
					class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"
				>
					<div>
						{#if (cursoAcreditado = acreditaciones.cursos.find((c) => c.id == curso.id))}
							{#if cursoAcreditado}
								<p class="label text-status-success">Acreditado</p>
							{/if}
						{:else}
							<p class="label">No acreditado</p>
						{/if}

						<p>{curso.nombre}</p>

						<p class="label">
							{#if curso.diplomado}
								{curso.diplomado.nombre}
							{:else}
								Sin diplomado
							{/if}
						</p>
					</div>

					{#if (cursoAcreditado = acreditaciones.cursos.find((c) => c.id == curso.id))}
						{#if cursoAcreditado && cursoAcreditado.documento}
							<div class="flex gap-8 justify-center">
								<a href={cursoAcreditado.documento} class="link primary"
									>Ver documento</a
								>
							</div>
						{/if}
					{/if}
				</article>
			{/each}
		</section>
	</header>
{/if}

{#if !$cursosDeDiplomadoModal}
	<h2 class="heading">Diplomados</h2>
	{#if $db_diplomados.length == 0}
		<p>No hay diplomados aun</p>
	{:else if diplomadosConCursos}
		<p class="label">
			{acreditaciones.diplomados.length} de
			{$db_diplomados.length} completados
		</p>
		<section class="flex flex-col gap-8 mt-4 mb-8">
			{#each diplomadosConCursos as diplomado (diplomado.id)}
				<article
					class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"
				>
					<div>
						{#if (diplomadoAcreditado = acreditaciones.diplomados.find((d) => d.id == diplomado.id))}
							{#if diplomadoAcreditado}
								<p class="label text-status-success">Acreditado</p>
							{/if}
						{:else}
							<p class="label">No acreditado</p>
						{/if}
						<p>{diplomado.nombre}</p>
						<p class="label">
							{acreditaciones.cursos.filter(
								(c) => c.id_diplomado == diplomado.id
							).length} de {diplomado.cursos.length} cursos completados
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
						{#if (diplomadoAcreditado = acreditaciones.diplomados.find((d) => d.id == diplomado.id))}
							{#if diplomadoAcreditado && diplomadoAcreditado.documento}
								<a href={diplomadoAcreditado.documento} class="link primary"
									>Ver documento</a
								>
							{/if}
						{/if}
					</div>
				</article>
			{/each}
		</section>
	{/if}

	<hr class="border my-12" />

	{#if cursosSinDiplomado && cursosSinDiplomado.length > 0}
		<h2 class="heading">Cursos sin diplomado</h2>
		<p class="label">
			{acreditaciones.cursos.filter((c) => !c.id_diplomado).length} de {cursosSinDiplomado.length}
			completados
		</p>

		<section class="flex flex-col gap-8 mt-4 mb-8">
			{#each cursosSinDiplomado as curso (curso.id)}
				<article
					class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"
				>
					<div>
						<span class="flex gap-1 justify-center">
							{#if (cursoAcreditado = acreditaciones.cursos.find((c) => c.id == curso.id))}
								{#if cursoAcreditado.cursado}
									<p class="label text-status-success">Completado</p>
								{:else}
									<p class="label">No completado</p>
								{/if}
								<p class="label">y</p>
								{#if cursoAcreditado.acreditado}
									<p class="label text-status-success">Acreditado</p>
								{:else}
									<p class="label">no Acreditado</p>
								{/if}
							{/if}
						</span>

						<p>{curso.nombre}</p>
					</div>

					{#if (cursoAcreditado = acreditaciones.cursos.find((c) => c.id == curso.id))}
						{#if cursoAcreditado && cursoAcreditado.documento}
							<div class="flex gap-8 justify-center">
								<a href={cursoAcreditado.documento} class="link primary"
									>Ver documento</a
								>
							</div>
						{/if}
					{/if}
				</article>
			{/each}
		</section>
	{/if}
{/if}
