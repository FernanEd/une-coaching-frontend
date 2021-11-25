import { writable } from 'svelte/store';

export const useModal = () => {
	let store = writable(false);

	return {
		...store,
		closeModal() {
			store.set(false);
		},
		openModal() {
			store.set(true);
		},
		toggleModal() {
			store.update((state) => !state);
		},
	};
};
