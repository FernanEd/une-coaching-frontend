<script lang="ts">
	import { cursos } from '$lib/stores/cursos';
	import { onMount } from 'svelte';

	let cursoName;

	onMount(() => {
		if ($cursos.length == 0) {
			cursos.getItems();
		}
	});

	const handleSubmit = () => {
		if (cursoName) {
			cursos.addItem({ nombre: cursoName, id_diplomado: null });
			cursoName = '';
		}
	};
</script>

<form on:submit|preventDefault={handleSubmit}>
	<header class="flex justify-between flex-wrap">
		<h2 class="heading">Cursos</h2>
		<button on:click={handleSubmit} class="btn primary"
			>Agregar curso
		</button>
	</header>

	<hr class="my-4 border-none" />

	<label class="w-full">
		<p class="label">Nombre del curso</p>
		<input
			type="text"
			class="w-full"
			bind:value={cursoName}
			required
		/>
	</label>
</form>

<hr class="my-4 border-none" />

<table class="table-fixed table shadow-lg max-w-xl w-full">
	<thead>
		<tr>
			<th>Curso</th>
			<th>...</th>
		</tr>
	</thead>
	<tbody class="max-h-60 overflow-auto">
		{#each $cursos as curso (curso.id)}
			<tr>
				<td>{curso.nombre}</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button class="font-bold text-accent">Editar curso</button
						>
						<button
							class="font-bold text-text-4"
							on:click={() => cursos.removeItem(curso.id)}
							>Eliminar curso</button
						>
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
