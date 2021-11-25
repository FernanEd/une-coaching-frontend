import type { Usuario } from './db';

export type userRoles =
	| 'docente'
	| 'coach'
	| 'administrativo'
	| 'coordinador'
	| 'instructor';

export interface userSession {
	user: Omit<Usuario, 'password'>;
	roles: userRoles[];
	token: string;
}

export interface session extends userSession {
	isLoggedIn: true;
}

declare module '$app/stores' {
	export const session: null;
}
