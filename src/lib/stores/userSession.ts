import type { JWT } from '$lib/utils/interfaces';
import { writable } from 'svelte/store';

export let userSession = writable<JWT>({
	currentUser: undefined,
	token: undefined,
	userRoles: undefined
});
