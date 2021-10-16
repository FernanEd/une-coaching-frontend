import type { JWT } from '$lib/utils/interfaces';
import { writable } from 'svelte/store';

export const userSession = writable<JWT | {}>(
	(() => {
		if (typeof window !== 'undefined') {
			return JSON.parse(localStorage.getItem('jwt')) || {};
		}

		return {};
	})()
);
