import { get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { fakeID } from './fakeID';
import { serverURL } from './serverURL';
import type { JWT } from './interfaces';

export const generateCRUD = <T extends { id: number }>(
	store: Writable<T[]>,
	route: string,
	session: Writable<JWT>
) => {
	let token = get(session) ? get(session)['token'] : '';
	let functions = {
		async getItems() {
			try {
				let res = await fetch(`${serverURL}/api/${route}`, {
					headers: {
						Authorization: token
					}
				});
				let data = await res.json();
				store.set(data);
			} catch (e) {
				throw Error(e);
			}
		},
		async addItem(newItem: Omit<T, 'id'>): Promise<T> {
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
				let res = await fetch(`${serverURL}/api/${route}`, {
					method: 'POST',
					body: JSON.stringify(newItem),
					headers: {
						Authorization: token,
						'Content-type': 'application/json'
					}
				});
				let data = await res.json();
				store.update((prev) =>
					prev.map((item) => (item.id === mockItem.id ? data : item))
				);
				return data;
			} catch (e) {
				store.set(oldStore);
				throw Error(e);
			}
		},
		async updateItem(
			id: number,
			newItem: Partial<Omit<T, 'id'>>
		): Promise<T> {
			let oldStore;
			store.update((prev) => {
				oldStore = prev;
				return prev.map((item) =>
					item.id != id ? item : { ...item, ...newItem }
				);
			});

			try {
				let res = await fetch(`${serverURL}/api/${route}/${id}`, {
					method: 'PUT',
					body: JSON.stringify(newItem),
					headers: {
						Authorization: token,
						'Content-type': 'application/json'
					}
				});
				let data = await res.json();
				return data;
			} catch (e) {
				store.set(oldStore);
				throw Error(e);
			}
		},
		async removeItem(id: number): Promise<T> {
			let oldStore;
			store.update((prev) => {
				oldStore = prev;
				return prev.filter((item) => item.id != id);
			});

			try {
				let res = await fetch(`${serverURL}/api/${route}/${id}`, {
					method: 'DELETE',
					headers: {
						Authorization: token
					}
				});
				let data = await res.json();
				return data;
			} catch (e) {
				store.set(oldStore);
				throw Error(e);
			}
		}
	};

	session.subscribe((value) => {
		let token = value ? value['token'] : '';

		functions = {
			async getItems() {
				try {
					let res = await fetch(`${serverURL}/api/${route}`, {
						headers: {
							Authorization: token
						}
					});
					let data = await res.json();
					store.set(data);
				} catch (e) {
					throw Error(e);
				}
			},
			async addItem(newItem: Omit<T, 'id'>): Promise<T> {
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
					let res = await fetch(`${serverURL}/api/${route}`, {
						method: 'POST',
						body: JSON.stringify(newItem),
						headers: {
							Authorization: token,
							'Content-type': 'application/json'
						}
					});
					let data = await res.json();
					store.update((prev) =>
						prev.map((item) =>
							item.id === mockItem.id ? data : item
						)
					);
					return data;
				} catch (e) {
					store.set(oldStore);
					throw Error(e);
				}
			},
			async updateItem(
				id: number,
				newItem: Partial<Omit<T, 'id'>>
			): Promise<T> {
				let oldStore;
				store.update((prev) => {
					oldStore = prev;
					return prev.map((item) =>
						item.id != id ? item : { ...item, ...newItem }
					);
				});

				try {
					let res = await fetch(`${serverURL}/api/${route}/${id}`, {
						method: 'PUT',
						body: JSON.stringify(newItem),
						headers: {
							Authorization: token,
							'Content-type': 'application/json'
						}
					});
					let data = await res.json();
					return data;
				} catch (e) {
					store.set(oldStore);
					throw Error(e);
				}
			},
			async removeItem(id: number): Promise<T> {
				let oldStore;
				store.update((prev) => {
					oldStore = prev;
					return prev.filter((item) => item.id != id);
				});

				try {
					let res = await fetch(`${serverURL}/api/${route}/${id}`, {
						method: 'DELETE',
						headers: {
							Authorization: token
						}
					});
					let data = await res.json();
					return data;
				} catch (e) {
					store.set(oldStore);
					throw Error(e);
				}
			}
		};
	});

	return functions;
};
