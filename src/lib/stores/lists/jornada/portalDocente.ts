import {
	db_cursosEnJornada,
	db_docentes,
	db_invitacionesCurso,
	db_jornadas,
} from '$lib/stores/db';
import type { InvitacionCurso } from '$lib/utils/types/db';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import type { CursoEnJornadaConInstructorConCurso } from './cursosEnJornadaConInstructorConCurso';

import { cursosEnJornadaConInstructorConCurso } from './cursosEnJornadaConInstructorConCurso';

interface InvitacionCursoConCursoJornada extends InvitacionCurso {
	cursoJornada: CursoEnJornadaConInstructorConCurso;
}

export const invitacionesCursoConCursoJornada: Readable<
	InvitacionCursoConCursoJornada[]
> = derived(
	[db_invitacionesCurso, cursosEnJornadaConInstructorConCurso],
	([invitaciones, cursosJornada]) =>
		invitaciones
			.map((i) => {
				let cursoJornadaDeLaInvitacion = cursosJornada.find(
					(c) => c.id == i.id_cursojornada
				);

				if (!cursoJornadaDeLaInvitacion) return;

				return {
					...i,
					cursoJornada: cursoJornadaDeLaInvitacion,
				};
			})
			.filter((i): i is InvitacionCursoConCursoJornada => i != undefined)
);

// portalDocente = {
//   invitaciones:
//   cursos:
//   acreditaciones:
// }

// invitaciones: {

// }

// cursos: {

// }

// acreditaciones: {

// }
