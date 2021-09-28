import { generateCRUD } from '$lib/utils/genericCRUD';
import type { Curso } from '$lib/utils/interfaces';
import { tick } from 'svelte';
import { writable } from 'svelte/store';

let store = writable<Curso[]>([]);
let crud = generateCRUD(store, 'cursos');
//Automatically invoce on export
store.subscribe((initialValue) => {
	if (initialValue.length == 0) {
		crud.getItems();
	}
});

export const cursos = { ...store, ...crud };
