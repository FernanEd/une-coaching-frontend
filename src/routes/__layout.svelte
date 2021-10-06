<script lang="ts">
	import { goto } from '$app/navigation';
	import { page, session } from '$app/stores';
	import type { JWT } from '$lib/utils/interfaces';
	import { onMount } from 'svelte';
	import '../app.postcss';

	let ses = session.subscribe((val) => {});
	let pg = page.subscribe((val) => {});

	onMount(async () => {
		let jwt: JWT | undefined = JSON.parse(
			localStorage.getItem('jwt')
		);

		if (!jwt) {
			await goto(`/login?next=${$page.path}`);
		} else {
			session.set({ ...jwt });
		}
	});
</script>

<slot />
