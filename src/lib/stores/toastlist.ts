import { writable } from 'svelte/store';

interface Toast {
	id: number;
	type: 'success' | 'danger' | 'neutral';
	content: string;
}

export const toasts = (() => {
	let id = 0;
	let store = writable<Toast[]>([]);

	const addToast = (
		type: 'success' | 'danger' | 'neutral',
		content,
		duration = 3000
	) => {
		id++;
		let newID = id;

		store.update((prev) => [
			...prev,
			{
				id: newID,
				type,
				content
			}
		]);

		setTimeout(() => {
			store.update((prev) => prev.filter((t) => t.id != newID));
		}, duration);
	};

	return {
		subscribe: store.subscribe,
		addToast,
		success: () =>
			addToast('success', 'Operación realizada con exito'),
		error: () =>
			addToast(
				'danger',
				'Ha habido un error. No se ha podido realizar la operación'
			)
	};
})();
