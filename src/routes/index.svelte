<script lang="ts">
	import Sexer from '$lib/components/sexer.svelte';
	import { diplomados } from '$lib/stores/diplomados';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	interface Diplomado {
		id: Number;
		nombre: string;
	}

	let text;
	let display = false;

	const toogleThisMF = () => {
		display = !display;
	};

	let updating;

	onMount(() => {
		if ($diplomados.length == 0) {
			diplomados.getItems();
		}
	});

	const handleSubmit = () => {
		diplomados.addItem({ nombre: text });
	};

	const updateItem = (id: number, newElement: any) => {
		diplomados.updateItem(id, { id, nombre: updating });
	};

	const removeItem = (id: number) => {
		diplomados.removeItem(id);
	};
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div>
	<form action="" on:submit|preventDefault={handleSubmit}>
		<input type="text" bind:value={text} />
		<button type="submit">Add diplomado</button>
	</form>

	<input type="text" bind:value={updating} />

	{#each $diplomados as diplomado (diplomado.id)}
		<div>
			<p>
				{diplomado.id} - {diplomado.nombre}
				<button
					class="p-2 text-white bg-blue-500 rounded"
					on:click={() => updateItem(diplomado.id, { nombre: updating })}>Editar</button
				>
				<button class="p-2 text-white bg-red-500 rounded" on:click={() => removeItem(diplomado.id)}
					>Remover</button
				>
			</p>
		</div>
	{/each}

	<div class="absolute right-0 top-0">
		<button on:click={toogleThisMF}>Hide</button>
		{#if display}
			<Sexer />
		{/if}
	</div>
</div>

<style>
	input {
		border: 1px solid #000000dd;
	}
</style>
