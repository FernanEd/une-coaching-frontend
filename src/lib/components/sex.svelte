<script lang="ts">
	import { serverURL } from '$lib/constants/serverURL';
	import type { Curso } from '$lib/utils/types/db';

	import { onMount } from 'svelte';

	let cursos: Curso[] = [];

	onMount(() => {
		(async () => {
			let res = await fetch(`${serverURL}/api/cursos`, {
				credentials: 'include',
			});
			let data = await res.json();
			console.log(data);
			cursos = data;
		})();
	});
</script>

{#each cursos as curso (curso.id)}
	<p class="py-2">{curso.nombre}</p>
{/each}
