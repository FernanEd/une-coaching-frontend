import type {
	Administrativo,
	AsistenteEnCurso,
	Coach,
	Competencia,
	Coordinador,
	Curso,
	CursoEnJornada,
	Diplomado,
	Docente,
	DocenteEnCoach,
	Instructor,
	InvitacionCurso,
	Jornada,
	RegistroCompetencia,
	RegistroCurso,
	RegistroDiplomado,
	Reporte,
	TipoCompetencia,
	Usuario,
} from '$lib/utils/types/db';
import { makeDBStore } from './utils/makeDBStore';

export const db_usuarios = makeDBStore<Usuario>('usuarios');
export const db_docentes = makeDBStore<Docente>('docentes');
export const db_coaches = makeDBStore<Coach>('coaches');
export const db_instructores = makeDBStore<Instructor>('instructores');
export const db_administrativos =
	makeDBStore<Administrativo>('administrativos');
export const db_coordinadores = makeDBStore<Coordinador>('coordinadores');

export const db_docentesEnCoaches =
	makeDBStore<DocenteEnCoach>('docentesEnCoaches');

export const db_jornadas = makeDBStore<Jornada>('jornadas');
export const db_cursosEnJornada =
	makeDBStore<CursoEnJornada>('cursosEnJornada');
export const db_asistentesEnCurso =
	makeDBStore<AsistenteEnCurso>('asistentesEnCurso');
export const db_reportes = makeDBStore<Reporte>('reportes');
export const db_invitacionesCurso =
	makeDBStore<InvitacionCurso>('invitacionesCursos');

export const db_registrosCompetencias = makeDBStore<RegistroCompetencia>(
	'registrosCompetencias'
);
export const db_registrosCursos = makeDBStore<RegistroCurso>('registrosCursos');
export const db_registrosDiplomados = makeDBStore<RegistroDiplomado>(
	'registrosDiplomados'
);

export const db_cursos = makeDBStore<Curso>('cursos');
export const db_diplomados = makeDBStore<Diplomado>('diplomados');
export const db_competencias = makeDBStore<Competencia>('competencias');
export const db_tiposCompetencias =
	makeDBStore<TipoCompetencia>('tiposCompetencias');
