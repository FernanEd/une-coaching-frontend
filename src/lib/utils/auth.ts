import { goto } from '$app/navigation';
import { userSession } from '$lib/stores/userSession';
import type { JWT } from './interfaces';

export const logIn = (jwt: JWT) => {
	localStorage.setItem('jwt', JSON.stringify(jwt));
	userSession.set(jwt);
};

export const logOut = () => {
	localStorage.removeItem('jwt');
	userSession.set({});
	goto('/login');
};