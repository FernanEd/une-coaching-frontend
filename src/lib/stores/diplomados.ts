import { generateCRUD } from '$lib/utils/genericCRUD';
import type { Diplomado } from '$lib/utils/interfaces';
import { writable } from 'svelte/store';

let store = writable<Diplomado[]>([]);
let crud = generateCRUD(store, 'diplomados');
store.subscribe((initialValue) => {
	if (initialValue.length == 0) {
		crud.getItems();
	}
});

export const diplomados = { ...store, ...crud };
