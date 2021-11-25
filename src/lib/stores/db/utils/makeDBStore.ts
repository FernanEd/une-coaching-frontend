import { writable } from 'svelte/store';
import { getCRUD } from './getCRUD';

export function makeDBStore<T extends { id: number }>(route: string) {
	let store = writable<T[]>([]);
	let crud = getCRUD(store, route);

	return {
		...store,
		...crud,
	};
}
