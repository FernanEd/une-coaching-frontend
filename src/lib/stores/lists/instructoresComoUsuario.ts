import type { Usuario } from '$lib/utils/types/db';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import { db_instructores, db_usuarios } from '../db';

export interface InstructorComoUsuario extends Usuario {
	id_instructor: number;
}

export const instructoresComoUsuario: Readable<InstructorComoUsuario[]> =
	derived([db_usuarios, db_instructores], ([usuarios, instructores]) =>
		instructores
			.map((c) => {
				const usuario = usuarios.find((u) => u.id == c.id_usuario);
				if (!usuario) return;

				return {
					...usuario,
					id_instructor: c.id,
				};
			})
			.filter((c): c is InstructorComoUsuario => c != undefined)
	);
