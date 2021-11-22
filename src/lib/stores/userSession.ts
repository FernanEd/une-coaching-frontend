import type { JWT } from '$lib/utils/interfaces';
import { writable } from 'svelte/store';

export const userSession = writable<JWT>({
	token: '',
	userID: undefined
});
export const loggedIn = writable(false);
