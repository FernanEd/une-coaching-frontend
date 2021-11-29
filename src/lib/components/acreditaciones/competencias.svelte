<script lang="ts">
	import { db_competencias, db_tiposCompetencias } from '$lib/stores/db';
	import type {
		AcreditacionCompetencia,
		Acreditaciones,
	} from '$lib/stores/lists/portal-docente/getAcreditacionesParaDocente';

	import type { Competencia, TipoCompetencia } from '$lib/utils/types/db';

	interface TipoConCompetencias extends TipoCompetencia {
		competencias: Competencia[];
	}

	export let acreditaciones: Acreditaciones;
	let tiposConCompetencias: TipoConCompetencias[] | undefined;
	$: tiposConCompetencias = $db_tiposCompetencias.map((t) => ({
		...t,
		competencias: $db_competencias.filter((c) => c.id_tipo == t.id),
	}));

	let competenciaAcreditada;

	let competenciasSinTipo: Competencia[] | undefined;
	$: competenciasSinTipo = $db_competencias.filter((c) => !c.id_tipo);
</script>

{#if tiposConCompetencias}
	{#each tiposConCompetencias as tipo (tipo.id)}
		<h2 class="heading">Competencias de tipo {tipo.nombre}</h2>
		<p class="label">
			{acreditaciones.competencias.filter((c) => c.id_tipo == tipo.id).length} de
			{tipo.competencias.length} completados
		</p>
		<section class="flex flex-col gap-8 mt-4 mb-8">
			{#each tipo.competencias as competencia (competencia.id)}
				<article
					class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"
				>
					<div>
						{#if (competenciaAcreditada = acreditaciones.competencias.find((c) => c.id == competencia.id))}
							{#if competenciaAcreditada}
								<p class="label text-status-success">Acreditada</p>
							{/if}
						{:else}
							<p class="label">No acreditada</p>
						{/if}
						<p>{competencia.nombre}</p>
					</div>

					{#if (competenciaAcreditada = acreditaciones.competencias.find((c) => c.id == competencia.id))}
						{#if competenciaAcreditada && competenciaAcreditada.documento}
							<div class="flex gap-8 justify-center">
								<a href={competenciaAcreditada.documento} class="link primary"
									>Ver documento</a
								>
							</div>
						{/if}
					{/if}
				</article>
			{/each}
		</section>
		<hr class="border my-12" />
	{/each}
{/if}

{#if competenciasSinTipo && competenciasSinTipo.length > 0}
	<h2 class="heading">Competencias sin tipo</h2>
	<p class="label">
		{acreditaciones.competencias.filter((c) => !c.id_tipo).length} de {competenciasSinTipo.length}
		completados
	</p>

	<section class="flex flex-col gap-8 mt-4 mb-8">
		{#each competenciasSinTipo as competencia (competencia.id)}
			<article
				class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"
			>
				<div>
					{#if (competenciaAcreditada = acreditaciones.competencias.find((c) => c.id == competencia.id))}
						{#if competenciaAcreditada}
							<p class="label text-status-success">Acreditada</p>
						{/if}
					{:else}
						<p class="label">No acreditada</p>
					{/if}
					<p>{competencia.nombre}</p>
				</div>

				{#if (competenciaAcreditada = acreditaciones.competencias.find((c) => c.id == competencia.id))}
					{#if competenciaAcreditada && competenciaAcreditada.documento}
						<div class="flex gap-8 justify-center">
							<a href={competenciaAcreditada.documento} class="link primary"
								>Ver documento</a
							>
						</div>
					{/if}
				{/if}
			</article>
		{/each}
	</section>
{/if}
