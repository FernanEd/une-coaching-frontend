<script lang="ts">
	import type { DocenteComoUsuario } from '$lib/stores/lists/coachList';

	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';
	export let docentes: DocenteComoUsuario[];

	let filterText = '';
</script>

<h2 class="heading">Lista de docentes</h2>

<hr class="my-2 border-none" />

<div class="ml-auto">
	<p class="label">Buscar docente</p>
	<input type="text" bind:value={filterText} />
</div>

<hr class="mb-4 border-none" />

{#if docentes}
	{#if docentes.length == 0}
		<p class="text-text-4">Sin docentes asignados.</p>
	{:else}
		<div class="flex flex-col gap-2">
			{#each makeArraySearchable(docentes, ['nombre', 'apellido_paterno', 'apellido_materno'], filterText) as docente (docente.id)}
				<div class="p-2 bg-neutral-100 rounded">
					<p class="label">
						{docente.matricula}
					</p>
					<p>
						{docente.nombre}
						{docente.apellido_paterno}
						{docente.apellido_materno}
					</p>
				</div>
			{/each}
		</div>
	{/if}
{/if}
