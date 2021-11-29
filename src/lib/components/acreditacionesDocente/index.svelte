<script lang="ts">
	import type { AcreditacionCurso } from '$lib/stores/lists/portal-docente/getAcreditacionesParaDocente';
	import type { Acreditaciones } from '$lib/stores/lists/portal-docente/getAcreditacionesParaDocente';
	import { getAcreditacionesParaDocente } from '$lib/stores/lists/portal-docente/getAcreditacionesParaDocente';
	import type { Readable } from 'svelte/store';
	import { useModal } from '$lib/stores/useModal';
	import { db_competencias, db_cursos, db_diplomados } from '$lib/stores/db';
	import type { Curso, Diplomado } from '$lib/utils/types/db';
	import Diplomados from './diplomados.svelte';
	import Competencias from './competencias.svelte';
	import Cursos from './cursos.svelte';

	export let docenteID: number | undefined;
	let acreditaciones: Readable<Acreditaciones | undefined> | undefined;
	$: acreditaciones = docenteID
		? getAcreditacionesParaDocente(docenteID)
		: undefined;

	let selectedSection: 'diplomados' | 'cursos' | 'competencias' = 'diplomados';
</script>

{#if acreditaciones && $acreditaciones}
	<!-- <h2 class="heading">Resumen de acreditaciones</h2>
	<div class="flex flex-col gap-2 mt-2">
		<p class="label">
			{$acreditaciones.cursos.length} de {$db_cursos.length} cursos completados
		</p>
		<p class="label">
			{$acreditaciones.diplomados.length} de {$db_diplomados.length} diplomados completados
		</p>
		<p class="label">
			{$acreditaciones.competencias.length} de {$db_competencias.length} competencias
			completados
		</p>
	</div>

	<hr class="border my-8" /> -->

	<p class="label text-center">Ver</p>
	<span class="mb-4 flex justify-center gap-4">
		<button
			class="link"
			on:click={() => (selectedSection = 'diplomados')}
			class:primary={selectedSection == 'diplomados'}>Diplomados</button
		>/
		<button
			class="link"
			on:click={() => (selectedSection = 'cursos')}
			class:primary={selectedSection == 'cursos'}>Cursos</button
		>/
		<button
			class="link"
			on:click={() => (selectedSection = 'competencias')}
			class:primary={selectedSection == 'competencias'}>Competencias</button
		>
	</span>

	{#if selectedSection == 'diplomados'}
		<Diplomados acreditaciones={$acreditaciones} />
	{:else if selectedSection == 'cursos'}
		<Cursos acreditaciones={$acreditaciones} />
	{:else if selectedSection == 'competencias'}
		<Competencias acreditaciones={$acreditaciones} />
	{/if}
{/if}
