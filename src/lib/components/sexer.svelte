<script lang="ts">
	import { diplomados } from '$lib/stores/diplomados';
	import { genID } from '$lib/utils/genID';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	interface Diplomado {
		id: Number;
		nombre: string;
	}

	let text;

	const serverURL = 'http://localhost:8000';

	onMount(async () => {
		if ($diplomados.length == 0) {
			try {
				let res = await fetch(`${serverURL}/diplomados`);
				let data = await res.json();
				diplomados.set(data);
			} catch (e) {}
		}
	});

	const handleSubmit = async () => {
		let newItem = {
			id: genID(),
			nombre: text
		};
		let oldDiplomados = $diplomados;
		diplomados.update((prev) => [...prev, newItem]);

		try {
			let res = await fetch(`${serverURL}/diplomados`, {
				method: 'POST',
				body: JSON.stringify({ nombre: text }),
				headers: {
					'Content-type': 'application/json'
				}
			});
			let data = await res.json();
			diplomados.update((prev) => prev.map((elem) => (elem.id === newItem.id ? data : elem)));
		} catch (e) {
			diplomados.set(oldDiplomados);
		}
	};

	const removeItem = async (id: number) => {
		let oldDiplomados = $diplomados;
		diplomados.update((prev) => prev.filter((d) => d.id != id));
		try {
			let res = await fetch(`${serverURL}/diplomados/${id}`, {
				method: 'DELETE'
			});
			let data = await res.json();
		} catch (e) {
			diplomados.set(oldDiplomados);
		}
	};

	let updating;

	const updateItem = async (id: number, element: any) => {};
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
