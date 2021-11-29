<script lang="ts">
	import { cursosConDiplomado } from '$lib/stores/lists/cursosConDiplomado';
	import type { Acreditaciones } from '$lib/stores/lists/portal-docente/getAcreditacionesParaDocente';

	export let acreditaciones: Acreditaciones;
	let cursoAcreditado;
</script>

<h2 class="heading">Cursos</h2>
<p class="label">
	{acreditaciones.cursos.length} de {$cursosConDiplomado.length}
	completados
</p>

<section class="flex flex-col gap-8 mt-4 mb-8">
	{#each $cursosConDiplomado as curso (curso.id)}
		<article class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8">
			<div>
				{#if (cursoAcreditado = acreditaciones.cursos.find((c) => c.id == curso.id))}
					{#if cursoAcreditado}
						<p class="label text-status-success">Completado</p>
						{#if cursoAcreditado.acreditado}
							<p class="label text-status-success">y Acreditado</p>
						{:else}
							<p class="label">y no Acreditado</p>
						{/if}
					{:else}
						<p class="label">No completado y no Acreditado</p>
					{/if}
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
