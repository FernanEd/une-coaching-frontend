import { serverURL } from '$lib/constants/serverURL';
import { get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { getFakeID } from './getFakeID';
import { tick } from 'svelte';

export const getCRUD = <T extends { id: number }>(
	store: Writable<T[]>,
	route: string
) => {
	const findItem = (id: number): T | undefined => {
		return get(store).find((item) => item.id == id);
	};

	const getItems = async () => {
		console.log('called');
		try {
			let res = await fetch(`${serverURL}/api/${route}`, {
				credentials: 'include',
			});

			if (res.status >= 400) throw Error('Sin autorización');

			let data: T[] = await res.json();
			store.set(data);
			return data;
		} catch (e) {
			console.log(e);
		}
	};

	const callOnce = (fn: Function) => {
		let hasBeenCalled = false;
		return async () => {
			if (!hasBeenCalled) {
				try {
					hasBeenCalled = true;
					await fn();
				} catch (e) {
					hasBeenCalled = false;
				}
			}
		};
	};

	const addItem = async (itemContents: Omit<T, 'id'>) => {
		let fakeItemID = getFakeID();
		//@ts-ignore
		let fakeNewItem: T = {
			id: fakeItemID,
			...itemContents,
		};
		store.update((prev) => [...prev, fakeNewItem]);

		try {
			let res = await fetch(`${serverURL}/api/${route}`, {
				credentials: 'include',
				headers: {
					'Content-type': 'application/json',
				},
				method: 'POST',
				body: JSON.stringify(itemContents),
			});

			if (res.status >= 400) throw Error('Sin autorización');

			let newItem: T = await res.json();
			store.update((prev) =>
				prev.map((item) => (item.id == fakeItemID ? newItem : item))
			);

			return newItem;
		} catch (e) {
			store.update((prev) => prev.filter((item) => item.id != fakeItemID));
			throw e;
		}
	};

	const updateItem = async (
		id: number,
		itemContents: Partial<Omit<T, 'id'>>
	) => {
		let oldItem = findItem(id);
		store.update((prev) =>
			prev.map((item) => (item.id == id ? { ...item, ...itemContents } : item))
		);

		try {
			let res = await fetch(`${serverURL}/api/${route}/${id}`, {
				credentials: 'include',
				headers: {
					'Content-type': 'application/json',
				},
				method: 'PUT',
				body: JSON.stringify(itemContents),
			});
			if (res.status >= 400) throw Error('Sin autorización');

			let updatedItem: T = await res.json();
			return updatedItem;
		} catch (e) {
			store.update((prev) =>
				prev.map((item) => (item.id == id ? oldItem || item : item))
			);
			throw e;
		}
	};

	const deleteItem = async (id: number) => {
		let oldStore = get(store);
		store.update((prev) => prev.filter((item) => item.id != id));

		try {
			let res = await fetch(`${serverURL}/api/${route}/${id}`, {
				credentials: 'include',
				method: 'DELETE',
			});
			if (res.status >= 400) throw Error('Sin autorización');

			let deletedItem: T = await res.json();
			return deletedItem;
		} catch (e) {
			store.set(oldStore);
			throw e;
		}
	};

	return {
		getItems: callOnce(getItems),
		findItem,
		addItem,
		updateItem,
		deleteItem,
	};
};
