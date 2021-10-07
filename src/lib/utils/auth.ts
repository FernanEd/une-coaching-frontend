import { writable } from 'svelte/store';
import type { JWT } from './interfaces';

export let currentSession = writable<JWT>();

export const logIn = (jwt: JWT) => {
	localStorage.setItem('jwt', JSON.stringify(jwt));
	currentSession.set({ ...jwt });
};

export const logOut = () => {
	localStorage.removeItem('jwt');
	currentSession.set(undefined);
};
