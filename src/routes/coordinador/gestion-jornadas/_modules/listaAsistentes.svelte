<script lang="ts">
	import type { AsistenteEnCursoConfirmado } from '$lib/stores/lists/jornada/asistentesEnCursoConfirmados';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';
	export let asistentes: AsistenteEnCursoConfirmado[];

	let filterText = '';
</script>

<h2 class="heading">Lista de asistentes</h2>

<hr class="my-2 border-none" />

<div class="ml-auto">
	<p class="label">Buscar docente</p>
	<input type="text" bind:value={filterText} />
</div>

<hr class="mb-4 border-none" />

{#if asistentes}
	{#if asistentes.length == 0}
		<p class="text-text-4">No hay asistentes aún.</p>
	{:else}
		<div class="flex flex-col gap-2">
			{#each makeArraySearchable( asistentes.map( ({ aprobado, cursado, docente }) => ({ ...docente, cursado, aprobado }) ), ['nombre', 'apellido_paterno', 'apellido_materno'], filterText ) as asistente (asistente.id)}
				<div class="p-2 bg-neutral-100 rounded">
					{#if asistente.cursado}
						<p class="label" class:text-status-success={asistente.aprobado}>
							{asistente.aprobado ? 'Aprobado' : 'Reprobado'}
						</p>
					{/if}
					<p>
						{asistente.nombre}
						{asistente.apellido_paterno}
						{asistente.apellido_materno}
					</p>
				</div>
			{/each}
		</div>
	{/if}
{/if}
