import { userSession } from '$lib/stores/userSession';
import { generateCRUD } from '$lib/utils/genericCRUD';
import { tick } from 'svelte';
import { writable } from 'svelte/store';
import type { JWT } from './interfaces';

export function generateStore<T extends { id: number }>(
	path: string
) {
	let store = writable<T[]>([]);
	let crud = generateCRUD(store, path, '');

	let crudStore = {
		...store,
		...crud
	};

	(async () => {
		userSession.subscribe((session) => {
			if (session.hasOwnProperty('token')) {
				crudStore = {
					...crudStore,
					...generateCRUD(store, path, (session as JWT).token)
				};

				try {
					crudStore.getItems();
				} catch (e) {
					console.log(e);
				}
			}
		});
		await tick();
	})();

	return crudStore;
}
