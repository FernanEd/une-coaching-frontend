import { userSession } from '$lib/stores/userSession';
import { generateCRUD } from '$lib/utils/genericCRUD';
import { writable } from 'svelte/store';

export function generateStore<T extends { id: number }>(
	path: string
) {
	let store = writable<T[]>([]);
	let crud = generateCRUD(store, path, '');

	const crudStore = {
		...store,
		...crud
	};

	userSession.subscribe((session) => {
		crud = generateCRUD(store, path, session.token);
	});

	try {
		crudStore.getItems();
	} catch (e) {
		console.log(e);
	}

	return crudStore;
}
