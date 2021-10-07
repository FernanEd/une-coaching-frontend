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
import { get } from 'svelte/store';

export const cursos = generateStore<Curso>('cursos');
export const diplomados = generateStore<Diplomado>('diplomados');
// export const competencias = generateStore<Competencia>(
// 	'competencias'
// );
// export const tipoCompetencias = generateStore<TipoCompetencia>(
// 	'tipoCompetencias'
// );

export const usuarios = generateStore<Usuario>('usuarios');
export const coaches = generateStore<Coach>('coaches');
export const docentes = generateStore<Docente>('docentes');
export const coordinadores = generateStore<Coordinador>(
	'coordinadores'
);
export const administrativos = generateStore<Administrativo>(
	'administrativos'
);
export const instructores = generateStore<Instructor>('instructores');

export const docentesEnCoaches = generateStore<DocentesEnCoaches>(
	'docentesEnCoaches'
);

export const jornadas = generateStore<Jornada>('jornadas');
export const cursosEnJornada = generateStore<CursoEnJornada>(
	'cursosEnJornada'
);
export const asistentesEnCurso = generateStore<AsistenteEnCurso>(
	'asistentesEnCurso'
);
export const reportes = generateStore<Reporte>('reportes');

export const registrosCompetencias = generateStore<RegistroCompetencia>(
	'registrosCompetencias'
);
export const registrosCursos = generateStore<RegistroCurso>(
	'registrosCursos'
);
export const registrosDiplomados = generateStore<RegistroDiplomado>(
	'registrosDiplomados'
);
