import type {
	AsistenteEnCurso,
	Competencia,
	Curso,
	Diplomado,
	Instructor,
	TipoCompetencia,
	Usuario
} from '$lib/utils/interfaces';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import { asistentesEnCurso } from './db/asistentesEnCurso';
import { cursos } from './db/cursos';
import { cursosEnJornada } from './db/cursosEnJornada';
import { diplomados } from './db/diplomados';
import { instructores } from './db/instructores';
import { usuarios } from './db/usuarios';

type cursoEnProgreso = AsistenteEnCurso & {
	instructor: Usuario & { id_instructor: number };
	curso: Curso & {
		diplomado: Diplomado;
	};
};

interface DocentePortal {
	user: Usuario & { id_docente: number };
	invitaciones: cursoEnProgreso[];
	cursos: cursoEnProgreso[];
	// acreditaciones: {
	// 	curso: Curso & {
	// 		diplomado: Diplomado;
	// 	};
	// 	competencias: Competencia & {
	// 		tipo: TipoCompetencia;
	// 	};
	// };
}

export const docentePortal = (docenteID: number) => {
	const store: Readable<DocentePortal> = derived(
		[
			asistentesEnCurso,
			cursosEnJornada,
			usuarios,
			instructores,
			cursos,
			diplomados
		],
		([
			$asistentesEnCurso,
			$cursosEnJornada,
			$usuarios,
			$instructores,
			$cursos,
			$diplomados
		]) => {
			if (!$asistentesEnCurso) return;

			let asistencias: cursoEnProgreso[] = $asistentesEnCurso
				.filter((a) => a.id_docente == docenteID)
				.map((a) => {
					let cursoJornada = $cursosEnJornada.find(
						(c) => c.id == a.id_cursojornada
					);
					let cursoDeCatalogoDeLaJornada = $cursos.find(
						(c) => c.id == cursoJornada.id_curso
					);

					return {
						...a,
						instructor: {
							...$usuarios.find(
								(u) =>
									u.id ==
									$instructores.find(
										(i) => i.id == cursoJornada.id_instructor
									).id_usuario
							),
							id_instructor: cursoJornada.id_instructor
						},
						curso: {
							...cursoDeCatalogoDeLaJornada,
							diplomado: $diplomados.find(
								(d) => d.id == cursoDeCatalogoDeLaJornada.id_diplomado
							)
						}
					};
				});

			return {
				user: {
					...$usuarios.find((u) => u.id == docenteID),
					id_docente: docenteID
				},
				invitaciones: asistencias.filter((a) => a.estado == 1),
				cursos: asistencias.filter(
					(a) => a.estado != 0 && a.estado != 1
				)
			};
		}
	);

	return store;
};
