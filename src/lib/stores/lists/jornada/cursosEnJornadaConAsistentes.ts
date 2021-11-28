import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { cursosEnJornadaConInstructorConCurso } from './cursosEnJornadaConInstructorConCurso';
import type { CursoEnJornadaConInstructorConCurso } from './cursosEnJornadaConInstructorConCurso';
import { docentesComoUsuarios } from '../docentesComoUsuario';
import { asistentesEnCursoConfirmados } from './asistentesEnCursoConfirmados';
import type { AsistenteEnCursoConfirmado } from './asistentesEnCursoConfirmados';

export interface CursoEnJornadaConAsistentes
	extends CursoEnJornadaConInstructorConCurso {
	asistentes: AsistenteEnCursoConfirmado[];
}

export const cursosEnJornadaConAsistentes: Readable<
	CursoEnJornadaConAsistentes[]
> = derived(
	[cursosEnJornadaConInstructorConCurso, asistentesEnCursoConfirmados],
	([cursosJornada, asistentes]) =>
		cursosJornada.map((cJ) => {
			return {
				...cJ,
				asistentes: asistentes.filter((a) => a.id_cursojornada == cJ.id),
			};
		})
);
