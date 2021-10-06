import { session } from '$app/stores';
import type { JWT } from './interfaces';

export const logIn = (jwt: JWT) => {
	localStorage.setItem('jwt', JSON.stringify(jwt));
	session.set({ ...jwt });
};

export const logOut = () => {
	localStorage.removeItem('jwt');
	session.set(undefined);
};
