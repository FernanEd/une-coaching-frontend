import { generateCRUD } from '$lib/utils/genericCRUD';
import { writable } from 'svelte/store';

export function generateStore<T extends { id: number }>(
	path: string
) {
	let store = writable<T[]>([]);
	let crud = generateCRUD(store, 'cursos');

	const crudStore = { ...store, ...crud };

	(async () => {
		let $val: any[];
		crudStore.subscribe(($) => ($val = $))();
		if ($val.length == 0) {
			await crudStore.getItems();
		}
	})();

	return crudStore;
}
