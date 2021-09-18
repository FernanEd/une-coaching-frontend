import { generateCRUD } from '$lib/utils/genericCRUD';
import type { Diplomado } from '$lib/utils/interfaces';
import { writable } from 'svelte/store';

let store = writable<Diplomado[]>([]);
let crud = generateCRUD(store, 'diplomados');

export const diplomados = { ...store, ...crud };
