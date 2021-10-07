<script lang="ts">
	import { goto } from '$app/navigation';
	import { page, session } from '$app/stores';
	import { currentSession } from '$lib/utils/auth';
	import type { JWT } from '$lib/utils/interfaces';
	import { onMount } from 'svelte';
	import '../app.postcss';

	let ses = session.subscribe((val) => {});
	let pg = page.subscribe((val) => {});

	onMount(async () => {
		if (!$currentSession) {
			let jwt: JWT | undefined = JSON.parse(
				localStorage.getItem('jwt')
			);

			if (!jwt) {
				await goto(`/login?next=${$page.path}`);
			} else {
				currentSession.set({ ...jwt });
			}
		}
	});
</script>

<slot />
