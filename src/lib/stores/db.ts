import { session } from '$app/stores';
import { generateStore } from '$lib/utils/generateStore';

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
	DocentesEnCoaches,
	Instructor,
	Jornada,
	RegistroCompetencia,
	RegistroCurso,
	RegistroDiplomado,
	Reporte,
	TipoCompetencia,
	Usuario
} from '$lib/utils/interfaces';
import { userSession } from './userSession';

export let cursos = generateStore<Curso>('cursos');
export let diplomados = generateStore<Diplomado>('diplomados');
export let usuarios = generateStore<Usuario>('usuarios');
export let coaches = generateStore<Coach>('coaches');
export let docentes = generateStore<Docente>('docentes');
export let coordinadores = generateStore<Coordinador>(
	'coordinadores'
);
export let administrativos = generateStore<Administrativo>(
	'administrativos'
);
export let instructores = generateStore<Instructor>('instructores');

export let docentesEnCoaches = generateStore<DocentesEnCoaches>(
	'docentesEnCoaches'
);

export let jornadas = generateStore<Jornada>('jornadas');
export let cursosEnJornada = generateStore<CursoEnJornada>(
	'cursosEnJornada'
);
export let asistentesEnCurso = generateStore<AsistenteEnCurso>(
	'asistentesEnCurso'
);
export let reportes = generateStore<Reporte>('reportes');

export let registrosCompetencias = generateStore<RegistroCompetencia>(
	'registrosCompetencias'
);
export let registrosCursos = generateStore<RegistroCurso>(
	'registrosCursos'
);
export let registrosDiplomados = generateStore<RegistroDiplomado>(
	'registrosDiplomados'
);
