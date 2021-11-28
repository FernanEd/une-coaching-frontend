import { db_asistentesEnCurso, db_cursos } from '$lib/stores/db';
import { derived } from 'svelte/store';
import { docentesComoUsuarios } from '../docentesComoUsuario';
import type { AsistenteEnCurso } from '$lib/utils/types/db';
import { cursosEnJornadaConInvitaciones } from '../jornada/cursosEnJornadaConInvitaciones';
import type { CursoEnJornadaConInvitaciones } from '../jornada/cursosEnJornadaConInvitaciones';

interface AsistenciaDeDocente extends AsistenteEnCurso {
	cursoJornada: CursoEnJornadaConInvitaciones;
}

export const getDocentesFaltantesDeCurso = (cursoJornadaID: number) =>
	derived(
		[
			docentesComoUsuarios,
			cursosEnJornadaConInvitaciones,
			db_asistentesEnCurso,
			db_cursos,
		],
		([docentes, cursosJornada, asistentes, cursos]) => {
			const cursoJornada = cursosJornada.find((cJ) => cJ.id == cursoJornadaID);

			if (!cursoJornada) return;

			const cursoABuscar = cursoJornada.curso;

			return docentes.filter((d) => {
				if (cursoJornada.invitaciones.find((i) => i.id_docente == d.id_docente))
					return false;

				const asistenciasDeDocente: AsistenciaDeDocente[] = asistentes
					.filter((a) => a.id_docente == d.id_docente)
					.map((a) => {
						const cursoJornadaDeLaAsistencia = cursosJornada.find(
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
					(a) => a.cursoJornada.curso.id == cursoABuscar.id
				);

				if (!docenteHaAsistido) return true;

				return docenteHaAsistido.aprobado ? false : true;
			});
		}
	);
