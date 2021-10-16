import { generateCRUD } from '$lib/utils/genericCRUD';
import { userSession } from '$lib/stores/userSession';
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

	if (!userSession) {
		return crudStore;
	}

	userSession.subscribe((session) => {
		if (session.hasOwnProperty('token')) {
			crudStore = {
				...crudStore,
				...generateCRUD(store, path, (session as JWT).token)
			};

			(async () => {
				try {
					await crudStore.getItems();
				} catch (e) {
					console.log(e);
				}
			})();
		}
	});

	return crudStore;
}
