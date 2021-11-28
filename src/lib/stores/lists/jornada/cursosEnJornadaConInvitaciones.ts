import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { cursosEnJornadaConInstructorConCurso } from './cursosEnJornadaConInstructorConCurso';
import type { CursoEnJornadaConInstructorConCurso } from './cursosEnJornadaConInstructorConCurso';
import { invitacionesCursoConDocente } from './invitacionesCursoConDocente';
import type { InvitacionCursoConDocente } from './invitacionesCursoConDocente';

export interface CursoEnJornadaConInvitaciones
	extends CursoEnJornadaConInstructorConCurso {
	invitaciones: InvitacionCursoConDocente[];
}

export const cursosEnJornadaConInvitaciones: Readable<
	CursoEnJornadaConInvitaciones[]
> = derived(
	[cursosEnJornadaConInstructorConCurso, invitacionesCursoConDocente],
	([cursosJornada, invitaciones]) =>
		cursosJornada.map((cJ) => {
			return {
				...cJ,
				invitaciones: invitaciones.filter((i) => i.id_cursojornada == cJ.id),
			};
		})
);
