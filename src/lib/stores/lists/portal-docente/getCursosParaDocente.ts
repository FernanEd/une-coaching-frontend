import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { jornadaActual } from '../jornada/jornadaActual';
import { cursosEnJornadaConInstructorConCurso } from '../jornada/cursosEnJornadaConInstructorConCurso';
import type { CursoEnJornadaConInstructorConCurso } from '../jornada/cursosEnJornadaConInstructorConCurso';
import { db_asistentesEnCurso } from '$lib/stores/db';

export interface CursoEnJornadaConCalificacion
	extends CursoEnJornadaConInstructorConCurso {
	aprobado: boolean;
}

export const getCursosParaDocente = (docenteID: number) => {
	const cursosDeLaJornadaActualParaInstructor: Readable<
		CursoEnJornadaConCalificacion[]
	> = derived(
		[cursosEnJornadaConInstructorConCurso, db_asistentesEnCurso, jornadaActual],
		([cursos, asistentes, jornadaActual]) => {
			let asistenciasDelDocente = asistentes.filter(
				(a) => a.id_docente == docenteID
			);

			let cursosDeLaJornadaActual = cursos
				.filter((c) => c.id_jornada == jornadaActual.id)
				.map((c) => {
					const asisteACurso = asistenciasDelDocente.find(
						(a) => a.id_cursojornada == c.id_jornada
					);

					if (!asisteACurso) return;

					return {
						...c,
						aprobado: asisteACurso.aprobado,
					};
				})
				.filter((c): c is CursoEnJornadaConCalificacion => c != undefined);

			return cursosDeLaJornadaActual;
		}
	);

	return cursosDeLaJornadaActualParaInstructor;
};
