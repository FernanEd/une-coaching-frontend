import type {
	AsistenteEnCurso,
	Competencia,
	Curso,
	CursoEnJornada,
	Diplomado,
	Instructor,
	RegistroCompetencia,
	RegistroCurso,
	RegistroDiplomado,
	TipoCompetencia,
	Usuario
} from '$lib/utils/interfaces';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import { asistentesEnCurso } from './db/asistentesEnCurso';
import { competencias } from './db/competencias';
import { cursos } from './db/cursos';
import { cursosEnJornada } from './db/cursosEnJornada';
import { diplomados } from './db/diplomados';
import { docentes } from './db/docentes';
import { instructores } from './db/instructores';
import { registrosCompetencias } from './db/registrosCompetencias';
import { registrosCursos } from './db/registrosCursos';
import { registrosDiplomados } from './db/registrosDiplomados';
import { tiposCompetencias } from './db/tipoCompetencias';
import { usuarios } from './db/usuarios';

export type AsistenteDeCursoDeInstructor = AsistenteEnCurso & {
	usuario: Usuario & {
		id_docente: number;
	};
};

type CursoDeInstructor = CursoEnJornada & {
	asistentes: AsistenteDeCursoDeInstructor[];
	curso: Curso & {
		diplomado: Diplomado;
	};
};

export interface InstructorPortal {
	user: Usuario & { id_instructor: number };
	cursos: CursoDeInstructor[];
}

export const getInstructorPortal = (usuarioID: number) => {
	const store: Readable<InstructorPortal> = derived(
		[
			asistentesEnCurso,
			cursosEnJornada,
			usuarios,
			docentes,
			instructores,
			cursos,
			diplomados
		],
		([
			$asistentesEnCurso,
			$cursosEnJornada,
			$usuarios,
			$docentes,
			$instructores,
			$cursos,
			$diplomados
		]) => {
			if (!usuarioID) return;

			if (!$asistentesEnCurso) return;
			if (!$cursosEnJornada) return;
			if (!$usuarios) return;
			if (!$instructores) return;
			if (!$docentes) return;
			if (!$cursos) return;
			if (!$diplomados) return;

			let instructor = $instructores.find(
				(i) => i.id_usuario == usuarioID
			);

			if (!instructor) return;

			let cursos: CursoDeInstructor[] = $cursosEnJornada
				.filter((cJ) => cJ.id_instructor == instructor.id)
				.map((cJ) => {
					let cursoDeLaJornada = $cursos.find(
						(c) => c.id == cJ.id_curso
					);

					return {
						...cJ,
						asistentes: $asistentesEnCurso
							.filter((a) => a.id_cursojornada == cJ.id)
							.map((a) => {
								let docente = $docentes.find(
									(d) => d.id == a.id_docente
								);
								return {
									...a,
									usuario: {
										...$usuarios.find(
											(u) => u.id == docente.id_usuario
										),
										id_docente: docente.id
									}
								};
							}),
						curso: {
							...cursoDeLaJornada,
							diplomado: $diplomados.find(
								(d) => d.id == cursoDeLaJornada?.id_diplomado
							)
						}
					};
				});

			return {
				user: {
					...$usuarios.find((u) => u.id == usuarioID),
					id_instructor: instructor.id
				},
				cursos
			};
		}
	);

	return store;
};
