<script lang="ts">
	import { docentes, usuarios } from '$lib/stores/db';

	let filterText;
	let docentesSeleccionados: string[] = [];

	const handleFilter = () => {};

	const handleSubmit = () => {};

	$: docentesList = $docentes.map((docente) => ({
		...$usuarios.find((usuario) => usuario.id == docente.id_usuario),
		id_docente: docente.id
	}));

	let filterFunction = (val) => val;
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	{#if $docentes.length == 0}
		<p>No hay docentes aún</p>
	{:else}
		<div class="ml-auto">
			<p class="label">Filtrar docentes por matricula</p>
			<input
				type="text"
				bind:value={filterText}
				on:input={handleFilter}
			/>
		</div>

		<p class="label">Selecciona docentes</p>
		<div class="flex flex-col gap-1 max-h-60 overflow-auto">
			{#each docentesList.filter(filterFunction) as docente (docente.id)}
				<label class="flex gap-2 items-center">
					<input
						type="checkbox"
						value={docente.id}
						bind:group={docentesSeleccionados}
					/>
					{docente.matricula} -
					{docente.nombre}
					{docente.apellido_paterno}
					{docente.apellido_materno}
				</label>
			{/each}
		</div>
	{/if}
</form>
