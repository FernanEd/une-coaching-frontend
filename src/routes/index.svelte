<script lang="ts">
	import { onMount } from 'svelte';

	interface Diplomado {
		id: Number;
		nombre: string;
	}

	let diplomados: Diplomado[] = [];
	let text;

	const serverURL = 'http://localhost:8000';

	onMount(async () => {
		let res = await fetch(`${serverURL}/diplomados`);
		let data = await res.json();
		diplomados = data;
	});

	const handleSubmit = async () => {
		let res = await fetch(`${serverURL}/diplomados`, {
			method: 'POST',
			body: JSON.stringify({ nombre: text }),
			headers: {
				'Content-type': 'application/json'
			}
		});
		let data = await res.json();
		console.log(data, text);
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

	{#each diplomados as diplomado (diplomado.id)}
		<div>
			<p>{diplomado.nombre}</p>
		</div>
	{/each}
</div>

<style>
	input {
		border: 1px solid #000000dd;
	}
</style>
