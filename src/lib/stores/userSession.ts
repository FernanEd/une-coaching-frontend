import type { JWT, Usuario } from '$lib/utils/interfaces';
import { writable } from 'svelte/store';
import { usuarioList } from './lists/usuariosList';

export const userSession = writable<JWT | {}>(
	(() => {
		if (typeof window !== 'undefined') {
			return JSON.parse(localStorage.getItem('jwt')) || {};
		}

		return {};
	})()
);
