<script lang="ts">
	import dayjs from 'dayjs';

	let format = 'YYYY-MM-DD';

	export let date: Date | undefined = undefined;
	let internal: string = '';

	const input = (x: Date | undefined) =>
		(internal = date ? dayjs(x).format(format) : internal);
	const output = (x: string) => (date = dayjs(x, format).toDate());

	$: if (date == undefined) {
		internal = '';
		//@ts-ignore (i dont even feel like reworking this)
	} else if (date != ' Invalid Date') {
		input(date);
	}

	$: {
		if (internal.charAt(0) != '0') {
			output(internal);
			input(date);
		}
	}
</script>

<input type="date" bind:value={internal} />
