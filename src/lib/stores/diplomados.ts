import type { Diplomado } from '$lib/utils/interfaces';
import { writable } from 'svelte/store';

export const diplomados = writable<Diplomado[]>([]);

// export const diplomadoStore = (() => {
// 	const store = writable<Diplomado[]>([]);

// 	return {
// 		...store
// 	};
// })();
