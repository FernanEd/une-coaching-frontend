import { serverURL } from '$lib/constants/serverURL';
import { get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { getFakeID } from './getFakeID';

export const getCRUD = <T extends { id: number }>(
	store: Writable<T[]>,
	route: string
) => {
	const findItem = (id: number): T | undefined => {
		return get(store).find((item) => item.id == id);
	};

	const getItems = async () => {
		try {
			let res = await fetch(`${serverURL}/api/${route}`, {
				credentials: 'include',
			});
			let data = await res.json();
			store.set(data);
		} catch (e) {
			throw e;
		}
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

			let newItem: T = await res.json();
			store.update((prev) =>
				prev.map((item) => (item.id == fakeItemID ? newItem : item))
			);
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
			await fetch(`${serverURL}/api/${route}/${id}`, {
				credentials: 'include',
				headers: {
					'Content-type': 'application/json',
				},
				method: 'PUT',
				body: JSON.stringify(itemContents),
			});
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
			await fetch(`${serverURL}/api/${route}/${id}`, {
				credentials: 'include',
				method: 'DELETE',
			});
		} catch (e) {
			store.set(oldStore);
			throw e;
		}
	};

	return {
		getItems,
		findItem,
		addItem,
		updateItem,
		deleteItem,
	};
};
