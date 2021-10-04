<script lang="ts">
	import { dateFormat } from '$lib/utils/dateFormat';

	import dayjs from 'dayjs';

	export let format = 'YYYY-MM-DD';
	export let date;

	let internal;

	const input = (x) => {
		internal = x ? dayjs(x).format(format) : undefined;
	};

	const output = (x) => {
		date = x ? dayjs(x, format).toDate() : undefined;
	};

	$: input(date);
	$: output(internal);
</script>

<input type="date" bind:value={internal} required />
