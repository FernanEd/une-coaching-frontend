import type { Curso, Diplomado } from '$lib/utils/types/db';
import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { db_cursos, db_diplomados } from '../db';

export interface CursoConDiplomado extends Curso {
	diplomado: Diplomado | undefined;
}

export const cursosConDiplomado: Readable<CursoConDiplomado[]> = derived(
	[db_cursos, db_diplomados],
	([cursos, diplomados]) =>
		cursos.map((c) => {
			const diplomadoDelCurso = diplomados.find((d) => d.id == c.id_diplomado);

			return {
				...c,
				diplomado: diplomadoDelCurso,
			};
		})
);
