import { writable } from 'svelte/store';

interface Prompt {
	type?: 'success' | 'danger' | 'neutral';
	message: string;
	onAccept?: Function;
	onCancel?: Function;
}

export const prompts = (() => {
	let store = writable<Prompt>();

	const showPrompt = (params: Prompt) => {
		store.set({
			onAccept: () => {},
			onCancel: () => {},
			type: 'neutral',
			...params
		});
	};

	const closePrompt = () => store.set(undefined);

	return {
		subscribe: store.subscribe,
		showPrompt,
		closePrompt
	};
})();
