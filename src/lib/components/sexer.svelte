<script lang="ts">
	import { diplomados } from '$lib/stores/diplomados';
	import { onMount } from 'svelte';

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
		if (text) {
			diplomados.addItem({ nombre: text });
		}

		text = '';
	};

	const updateItem = (id: number, newElement: any) => {
		diplomados.updateItem(id, { nombre: updating });
		updating = '';
	};

	const removeItem = (id: number) => {
		diplomados.removeItem(id);
	};
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="bg-blue-100">
	<form action="" on:submit|preventDefault={handleSubmit}>
		<input type="text" bind:value={text} />
		<input type="text" bind:value={updating} />
		<button type="submit">Add diplomado</button>
	</form>

	{#each $diplomados as diplomado (diplomado.id)}
		<div>
			<p>
				{diplomado.id} - {diplomado.nombre}

				<button class="p-2 text-white bg-red-500 rounded" on:click={() => removeItem(diplomado.id)}
					>Remover</button
				>
			</p>
		</div>
	{/each}
</div>

<style>
	input {
		border: 1px solid #000000dd;
	}
</style>
