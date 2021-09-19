import { tick } from 'svelte';
import type { Writable } from 'svelte/store';
import { fakeID } from './fakeID';
import { serverURL } from './serverURL';

export const generateCRUD = <T extends { id: number }>(store: Writable<T[]>, route: string) => ({
	async getItems() {
		try {
			let res = await fetch(`${serverURL}/diplomados`);
			let data = await res.json();
			store.set(data);
		} catch (e) {
			throw Error(e);
		}
	},
	async addItem(newItem: Omit<T, 'id'>) {
		//@ts-ignore
		let mockItem: T = {
			...newItem,
			id: fakeID()
		};

		let oldStore;
		store.update((prev) => {
			oldStore = prev;
			return [...prev, mockItem];
		});

		try {
			let res = await fetch(`${serverURL}/${route}`, {
				method: 'POST',
				body: JSON.stringify(newItem),
				headers: {
					'Content-type': 'application/json'
				}
			});
			let data = await res.json();
			store.update((prev) => prev.map((item) => (item.id === mockItem.id ? data : item)));
		} catch (e) {
			store.set(oldStore);
			throw Error(e);
		}
	},
	async updateItem(id: number, newItem: Omit<T, 'id'>) {
		let oldStore;
		store.update((prev) => {
			oldStore = prev;
			return prev.map((item) => (item.id != id ? item : { ...item, ...newItem }));
		});

		try {
			let res = await fetch(`${serverURL}/${route}/${id}`, {
				method: 'PUT',
				body: JSON.stringify(newItem),
				headers: {
					'Content-type': 'application/json'
				}
			});
			await res.json();
		} catch (e) {
			store.set(oldStore);
			throw Error(e);
		}
	},
	async removeItem(id: number) {
		let oldStore;
		store.update((prev) => {
			oldStore = prev;
			return prev.filter((item) => item.id != id);
		});

		try {
			let res = await fetch(`${serverURL}/${route}/${id}`, {
				method: 'DELETE'
			});
			await res.json();
		} catch (e) {
			store.set(oldStore);
			throw Error(e);
		}
	}
});
