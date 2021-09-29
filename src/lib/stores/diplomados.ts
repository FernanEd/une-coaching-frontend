import { generateCRUD } from '$lib/utils/genericCRUD';
import type { Diplomado } from '$lib/utils/interfaces';
import { writable } from 'svelte/store';

let store = writable<Diplomado[]>([]);
let crud = generateCRUD(store, 'diplomados');

export const diplomados = { ...store, ...crud };

(async () => {
	let $val: any[];
	diplomados.subscribe(($) => ($val = $))();
	if ($val.length == 0) {
		await diplomados.getItems();
	}
})();
