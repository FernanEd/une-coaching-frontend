import type { Usuario } from './db';

export interface userSession {
	user: Omit<Usuario, 'password'>;
	roles: (
		| 'docente'
		| 'coach'
		| 'administrativo'
		| 'coordinador'
		| 'instructor'
	)[];
	token: string;
}

export interface session extends userSession {
	isLoggedIn: true;
}

declare module '$app/stores' {
	export const session: null;
}
