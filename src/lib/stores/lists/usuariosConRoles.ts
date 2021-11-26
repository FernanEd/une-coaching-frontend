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

export interface RolesDeUsuario {
	id: number;
	rol: userRoles;
}
export interface UsuarioConRoles extends Usuario {
	roles: RolesDeUsuario[];
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
			let foundRoles: RolesDeUsuario[] = [];
			let docente = docentes.find((a) => a.id_usuario == u.id);
			let coach = coaches.find((a) => a.id_usuario == u.id);
			let instructor = instructores.find((a) => a.id_usuario == u.id);
			let coordinador = coordinadores.find((a) => a.id_usuario == u.id);
			let administrativo = administrativos.find((a) => a.id_usuario == u.id);

			if (docente)
				foundRoles.push({
					id: docente.id,
					rol: 'docente',
				});
			if (coach)
				foundRoles.push({
					id: coach.id,
					rol: 'coach',
				});
			if (instructor)
				foundRoles.push({
					id: instructor.id,
					rol: 'instructor',
				});
			if (coordinador)
				foundRoles.push({
					id: coordinador.id,
					rol: 'coordinador',
				});
			if (administrativo)
				foundRoles.push({
					id: administrativo.id,
					rol: 'administrativo',
				});

			return {
				...u,
				roles: foundRoles,
			};
		});
	}
);
