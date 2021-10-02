import { generateStore } from '$lib/utils/generateStore';
import type {
	Administrativo,
	Coach,
	Competencia,
	Coordinador,
	Curso,
	Diplomado,
	Docente,
	DocentesEnCoaches,
	Instructor,
	TipoCompetencia,
	Usuario
} from '$lib/utils/interfaces';

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
