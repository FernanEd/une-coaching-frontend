<script>
	import { onMount } from 'svelte';
	import dayjs from 'dayjs';

	let format = 'YYYY-MM-DD';
	export let date = undefined;
	export let required;

	let internal;

	const input = (x) => (internal = date ? dayjs(x).format(format) : '');
	const output = (x) => (date = dayjs(x, format).toDate());

	$: input(date);
	$: output(internal);
</script>

<input type="date" bind:value={internal} {required} />
