import { db_cursosEnJornada, db_invitacionesCurso } from '$lib/stores/db';
import type { CursoEnJornada, InvitacionCurso } from '$lib/utils/types/db';
import { derived } from 'svelte/store';
import type { CursoConDiplomado } from '../cursosConDiplomado';
import { cursosConDiplomado } from '../cursosConDiplomado';
import { instructoresComoUsuario } from '../instructoresComoUsuario';
import type { InstructorComoUsuario } from '../instructoresComoUsuario';

export interface InvitacionCursoConInstructorConCurso extends InvitacionCurso {
	cursoJornada: CursoEnJornada;
	curso: CursoConDiplomado;
	instructor: InstructorComoUsuario | undefined;
}

export const getInvitacionesParaDocente = (docenteID: number) =>
	derived(
		[
			db_invitacionesCurso,
			cursosConDiplomado,
			instructoresComoUsuario,
			db_cursosEnJornada,
		],
		([invitaciones, cursos, instructores, cursosJornada]) =>
			invitaciones
				.filter((i) => i.id_docente == docenteID && i.estado_invitacion == 0)
				.map((i) => {
					const cursoJornadaDeLaInvitacion = cursosJornada.find(
						(cJ) => cJ.id == i.id_cursojornada
					);

					if (!cursoJornadaDeLaInvitacion) return;

					const cursoDeLaInvitacion = cursos.find(
						(c) => c.id == cursoJornadaDeLaInvitacion.id_curso
					);

					if (!cursoDeLaInvitacion) return;

					const instructorDeLaInvitacion = instructores.find(
						(i) => i.id_instructor == cursoJornadaDeLaInvitacion.id_instructor
					);

					return {
						...i,
						curso: cursoDeLaInvitacion,
						instructor: instructorDeLaInvitacion,
						cursoJornada: cursoJornadaDeLaInvitacion,
					};
				})
				.filter(
					(i): i is InvitacionCursoConInstructorConCurso => i != undefined
				)
	);
