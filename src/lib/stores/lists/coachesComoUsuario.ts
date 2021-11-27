import type { Usuario } from '$lib/utils/types/db';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import { db_coaches, db_docentes, db_usuarios } from '../db';

export interface CoachComoUsuario extends Usuario {
	id_coach: number;
}

export const coachesComoUsuarios: Readable<CoachComoUsuario[]> = derived(
	[db_usuarios, db_coaches],
	([usuarios, coaches]) =>
		coaches
			.map((c) => {
				const usuario = usuarios.find((u) => u.id == c.id_usuario);
				if (!usuario) return;

				return {
					...usuario,
					id_coach: c.id,
				};
			})
			.filter((c): c is CoachComoUsuario => c != undefined)
);
