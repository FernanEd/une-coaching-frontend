import type { JWT } from '$lib/utils/interfaces';
import { writable } from 'svelte/store';

export let userSession = writable<JWT | undefined>(
	(() => {
		if (typeof window !== 'undefined') {
			return JSON.parse(localStorage.getItem('jwt'));
		}
	})()
);
