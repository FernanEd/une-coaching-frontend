import type { Usuario } from '$lib/utils/types/db';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import { db_coordinadores, db_usuarios } from '../db';

export interface CoordinadorComoUsuario extends Usuario {
	id_coordinador: number;
}

export const coordinadoresComoUsuario: Readable<CoordinadorComoUsuario[]> =
	derived([db_usuarios, db_coordinadores], ([usuarios, coordinadores]) =>
		coordinadores
			.map((c) => {
				const usuario = usuarios.find((u) => u.id == c.id_usuario);
				if (!usuario) return;

				return {
					...usuario,
					id_coordinador: c.id,
				};
			})
			.filter((c): c is CoordinadorComoUsuario => c != undefined)
	);
