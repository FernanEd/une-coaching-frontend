import { generateCRUD } from '$lib/utils/genericCRUD';
import type { Curso } from '$lib/utils/interfaces';
import { onMount, tick } from 'svelte';
import { writable } from 'svelte/store';

let store = writable<Curso[]>([]);
let crud = generateCRUD(store, 'cursos');

export const cursos = { ...store, ...crud };

(async () => {
	let $val: any[];
	cursos.subscribe(($) => ($val = $))();
	if ($val.length == 0) {
		await cursos.getItems();
	}
})();
