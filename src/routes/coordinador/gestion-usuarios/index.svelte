<script lang="ts">
	import { cursos } from '$lib/stores/db';

	import { onMount } from 'svelte';

	let editingCursoID: number;
	let cursoLabel: string | undefined;

	onMount(() => {
		cursos.getItems();
	});

	$: console.log(cursos.findItem(editingCursoID));
</script>

<form
	on:submit|preventDefault={() =>
		cursos.addItem({
			nombre: cursoLabel || 'noname',
			id_diplomado: undefined,
		})}
>
	<p class="label">Nombre curso</p>
	<input type="text" bind:value={cursoLabel} />
	<button type="submit" class="btn primary">Crear</button>
</form>

<button
	class="btn bg-yellow-300"
	on:click={() => cursos.updateItem(editingCursoID, { nombre: cursoLabel })}
	>Editar</button
>

{#each $cursos as curso (curso.id)}
	<div class="flex gap-8">
		<p>{curso.id} - {curso.nombre}</p>
		<button class="btn primary" on:click={() => (editingCursoID = curso.id)}
			>Editar</button
		>
		<button class="btn" on:click={() => cursos.deleteItem(curso.id)}
			>Borrar</button
		>
	</div>
{/each}
