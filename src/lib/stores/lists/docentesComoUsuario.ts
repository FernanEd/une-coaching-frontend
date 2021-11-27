import type { Usuario } from '$lib/utils/types/db';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import { db_docentes, db_usuarios } from '../db';

export interface DocenteComoUsuario extends Usuario {
	id_docente: number;
}

export const docentesComoUsuarios: Readable<DocenteComoUsuario[]> = derived(
	[db_usuarios, db_docentes],
	([usuarios, docentes]) =>
		docentes
			.map((c) => {
				const usuario = usuarios.find((u) => u.id == c.id_usuario);
				if (!usuario) return;

				return {
					...usuario,
					id_docente: c.id,
				};
			})
			.filter((c): c is DocenteComoUsuario => c != undefined)
);
