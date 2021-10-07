import { userSession } from '$lib/stores/userSession';
import { generateCRUD } from '$lib/utils/genericCRUD';
import { writable } from 'svelte/store';

export function generateStore<T extends { id: number }>(
	path: string
) {
	let store = writable<T[]>([]);
	let crud = generateCRUD(store, path, '');

	let crudStore = {
		...store,
		...crud
	};

	userSession.subscribe((session) => {
		if (session) {
			crudStore = {
				...crudStore,
				...generateCRUD(store, path, session.token)
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

	(async () => {
		try {
			await crudStore.getItems();
		} catch (e) {
			console.log(e);
		}
	})();

	return crudStore;
}
