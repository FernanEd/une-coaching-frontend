import { db_cursosEnJornada, db_jornadas } from '$lib/stores/db';
import type { CursoEnJornada, Jornada } from '$lib/utils/types/db';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import type { CursoConDiplomado } from '../cursosConDiplomado';
import { cursosConDiplomado } from '../cursosConDiplomado';
import type { InstructorComoUsuario } from '../instructoresComoUsuario';
import { instructoresComoUsuario } from '../instructoresComoUsuario';

export interface CursoEnJornadaConInstructorConCurso extends CursoEnJornada {
	jornada: Jornada;
	curso: CursoConDiplomado;
	instructor: InstructorComoUsuario | undefined;
}

export const cursosEnJornadaConInstructorConCurso: Readable<
	CursoEnJornadaConInstructorConCurso[]
> = derived(
	[
		db_cursosEnJornada,
		db_jornadas,
		cursosConDiplomado,
		instructoresComoUsuario,
	],
	([cursosEnJornada, jornadas, cursos, instructores]) =>
		cursosEnJornada
			.map((cJ) => {
				let jornadaDelCursoEnJornada = jornadas.find(
					(j) => j.id == cJ.id_jornada
				);

				let cursoDelCursoEnJornada = cursos.find((c) => c.id == cJ.id_curso);

				let instructorDelCursoEnJornada = instructores.find(
					(i) => i.id_instructor == cJ.id_instructor
				);

				if (!(jornadaDelCursoEnJornada && cursoDelCursoEnJornada)) return;

				return {
					...cJ,
					curso: cursoDelCursoEnJornada,
					instructor: instructorDelCursoEnJornada,
					jornada: jornadaDelCursoEnJornada,
				};
			})
			.filter(
				(cJ): cJ is CursoEnJornadaConInstructorConCurso => cJ != undefined
			)
);
