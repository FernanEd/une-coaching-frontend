import type { Usuario } from '$lib/utils/interfaces';
import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import {
	administrativos,
	coaches,
	coordinadores,
	docentes,
	instructores,
	usuarios
} from './db';

const checkUserExists = <
	T extends { id: number; id_usuario: number }
>(
	list: T[],
	value: any,
	rol: string
): Rol | null => {
	let match = list.find((d) => d.id_usuario == value);
	if (match) {
		return { id: match.id, rol };
	} else {
		null;
	}
};

export interface Rol {
	id: number;
	rol: string;
}

export type UsuarioConRoles = Pick<
	Usuario & { roles: Rol[] },
	| 'id'
	| 'correo'
	| 'apellido_materno'
	| 'apellido_paterno'
	| 'matricula'
	| 'nombre'
	| 'password'
	| 'roles'
>;

export const usuarioList: Readable<UsuarioConRoles[]> = derived(
	[
		usuarios,
		docentes,
		coaches,
		coordinadores,
		instructores,
		administrativos
	],
	([
		$usuarios,
		$docentes,
		$coaches,
		$coordinadores,
		$instructores,
		$administrativos
	]) =>
		$usuarios.map((user) => ({
			...user,
			roles: [
				checkUserExists($docentes, user.id, 'docente'),
				checkUserExists($coaches, user.id, 'coach'),
				checkUserExists($coordinadores, user.id, 'coordinador'),
				checkUserExists($instructores, user.id, 'instructor'),
				checkUserExists($administrativos, user.id, 'administrativo')
			].filter((v) => v)
		}))
);
