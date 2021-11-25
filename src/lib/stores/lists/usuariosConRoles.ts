import type { Usuario } from '$lib/utils/types/db';
import type { userRoles } from '$lib/utils/types/session';
import { derived, get } from 'svelte/store';
import {
	db_administrativos,
	db_coaches,
	db_coordinadores,
	db_docentes,
	db_instructores,
	db_usuarios,
} from '../db';

export interface UsuarioConRoles extends Usuario {
	roles: userRoles[];
}

export const usuariosConRoles = derived(
	[
		db_usuarios,
		db_docentes,
		db_coaches,
		db_instructores,
		db_coordinadores,
		db_administrativos,
	],
	([
		usuarios,
		docentes,
		coaches,
		instructores,
		coordinadores,
		administrativos,
	]) => {
		db_usuarios.getItems();
		db_docentes.getItems();
		db_coaches.getItems();
		db_instructores.getItems();
		db_coordinadores.getItems();
		db_administrativos.getItems();

		return usuarios.map((u): UsuarioConRoles => {
			let foundRoles: userRoles[] = [];

			if (docentes.find((a) => a.id_usuario == u.id))
				foundRoles.push('docente');
			if (coaches.find((a) => a.id_usuario == u.id)) foundRoles.push('coach');
			if (instructores.find((a) => a.id_usuario == u.id))
				foundRoles.push('instructor');
			if (coordinadores.find((a) => a.id_usuario == u.id))
				foundRoles.push('coordinador');
			if (administrativos.find((a) => a.id_usuario == u.id))
				foundRoles.push('administrativo');

			return {
				...u,
				roles: foundRoles,
			};
		});
	}
);
