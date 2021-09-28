<script lang="ts">
	import { cursos } from '$lib/stores/cursos';
	import type { Curso } from '$lib/utils/interfaces';

	let filterText;
	let filterFunction: (val: Curso) => boolean = (val) => true;

	const handleSubmit = () => {};

	const handleFilter = () => {
		if (filterText) {
			filterFunction = (val) => val.nombre.includes(filterText);
		} else {
			filterFunction = (val) => true;
		}
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col gap-4 max-w-xl w-screen"
>
	<div class="flex justify-between">
		<h2 class="heading">Diplomados</h2>
		<button class="btn primary">Agregar diplomado</button>
	</div>
	<div>
		<p class="label">Nombre del diplomado</p>
		<input type="text" class="w-full" />
	</div>
	<div class="ml-auto">
		<p class="label">Filtrar cursos</p>
		<input
			type="text"
			bind:value={filterText}
			on:input={handleFilter}
		/>
	</div>
	<div>
		<p class="label">Agregar cursos</p>
		<div class="flex flex-col gap-2 max-h-60 overflow-auto">
			{#each $cursos.filter(filterFunction) as curso (curso.id)}
				<label class="flex gap-2 items-center">
					<input type="checkbox" value={curso.id} />
					{curso.nombre}
				</label>
			{/each}
		</div>
	</div>
</form>
