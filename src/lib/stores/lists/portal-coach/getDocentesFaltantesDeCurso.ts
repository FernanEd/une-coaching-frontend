import {
	db_asistentesEnCurso,
	db_cursos,
	db_cursosEnJornada,
} from '$lib/stores/db';
import { derived } from 'svelte/store';
import { docentesComoUsuarios } from '../docentesComoUsuario';
import type {
	AsistenteEnCurso,
	CursoEnJornada,
	Curso,
} from '$lib/utils/types/db';

interface CursoEnJornadaConCurso extends CursoEnJornada {
	curso: Curso;
}

interface AsistenciaDeDocente extends AsistenteEnCurso {
	cursoJornada: CursoEnJornadaConCurso;
}

export const getDocentesFaltantesDeCurso = (cursoID: number) =>
	derived(
		[docentesComoUsuarios, db_asistentesEnCurso, db_cursosEnJornada, db_cursos],
		([docentes, asistentes, cursosEnJornada, cursos]) =>
			docentes.filter((d) => {
				const asistenciasDeDocente: AsistenciaDeDocente[] = asistentes
					.filter((a) => a.id_docente == d.id_docente)
					.map((a) => {
						const cursoJornadaDeLaAsistencia = cursosEnJornada.find(
							(cJ) => cJ.id == a.id_cursojornada
						);

						if (!cursoJornadaDeLaAsistencia) return;

						const cursoDelCursoJornada = cursos.find(
							(c) => c.id == cursoJornadaDeLaAsistencia.id_curso
						);

						if (!cursoDelCursoJornada) return;

						return {
							...a,
							cursoJornada: {
								...cursoJornadaDeLaAsistencia,
								curso: cursoDelCursoJornada,
							},
						};
					})
					.filter((a): a is AsistenciaDeDocente => a != undefined);

				const docenteHaAsistido = asistenciasDeDocente.find(
					(a) => a.cursoJornada.curso.id == cursoID
				);

				if (!docenteHaAsistido) return true;

				return docenteHaAsistido.aprobado ? false : true;
			})
	);
