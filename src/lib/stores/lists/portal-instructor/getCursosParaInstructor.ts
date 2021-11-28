import { derived } from 'svelte/store';
import { cursosEnJornadaConAsistentes } from '../jornada/cursosEnJornadaConAsistentes';
import type { Readable } from 'svelte/store';
import type { CursoEnJornadaConAsistentes } from '../jornada/cursosEnJornadaConAsistentes';
import { jornadaActual } from '../jornada/jornadaActual';

export const getCursosParaInstructor = (instructorID: number) => {
	const cursosDeLaJornadaActualParaInstructor: Readable<
		CursoEnJornadaConAsistentes[]
	> = derived(
		[cursosEnJornadaConAsistentes, jornadaActual],
		([cursos, jornadaActual]) =>
			jornadaActual
				? cursos.filter(
						(c) =>
							c.id_jornada == jornadaActual.id &&
							c.id_instructor == instructorID
				  )
				: []
	);

	return cursosDeLaJornadaActualParaInstructor;
};
