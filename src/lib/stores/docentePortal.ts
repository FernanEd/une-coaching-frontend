import type {
	AsistenteEnCurso,
	Competencia,
	Curso,
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

type cursoEnProgreso = AsistenteEnCurso & {
	instructor: Usuario & { id_instructor: number };
	curso: Curso & {
		diplomado: Diplomado;
	};
};

type registroAcreditacionCurso = RegistroCurso & {
	curso: Curso & {
		diplomado: Diplomado;
	};
};

type registroAcreditacionDiplomado = RegistroDiplomado & {
	diplomado: Diplomado;
};

type registroAcreditacionCompetencia = RegistroCompetencia & {
	competencia: Competencia & {
		tipo: TipoCompetencia;
	};
};

export interface DocentePortal {
	user: Usuario & { id_docente: number };
	invitaciones: cursoEnProgreso[];
	cursos: cursoEnProgreso[];
	acreditaciones: {
		cursos: registroAcreditacionCurso[];
		diplomados: registroAcreditacionDiplomado[];
		competencias: registroAcreditacionCompetencia[];
	};
}

export const getDocentePortal = (usuarioID: number) => {
	const store: Readable<DocentePortal> = derived(
		[
			asistentesEnCurso,
			cursosEnJornada,
			usuarios,
			docentes,
			instructores,
			competencias,
			tiposCompetencias,
			cursos,
			diplomados,
			registrosCompetencias,
			registrosCursos,
			registrosDiplomados
		],
		([
			$asistentesEnCurso,
			$cursosEnJornada,
			$usuarios,
			$docentes,
			$instructores,
			$competencias,
			$tiposCompetencias,
			$cursos,
			$diplomados,
			$registrosCompetencias,
			$registrosCursos,
			$registrosDiplomados
		]) => {
			if (!usuarioID) return;

			if (!$asistentesEnCurso) return;
			if (!$cursosEnJornada) return;
			if (!$usuarios) return;
			if (!$instructores) return;
			if (!$docentes) return;
			if (!$cursos) return;
			if (!$diplomados) return;

			let docente = $docentes.find((d) => d.id_usuario == usuarioID);

			let asistencias: cursoEnProgreso[] = $asistentesEnCurso
				.filter((a) => a.id_docente == docente.id)
				.map((a) => {
					let cursoJornada = $cursosEnJornada.find(
						(c) => c.id == a.id_cursojornada
					);

					if (!cursoJornada) return;

					let cursoDeCatalogoDeLaJornada = $cursos.find(
						(c) => c.id == cursoJornada.id_curso
					);

					if (!cursoDeCatalogoDeLaJornada) return;

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
					...$usuarios.find((u) => u.id == usuarioID),
					id_docente: docente.id
				},
				invitaciones: asistencias.filter((a) =>
					a ? a.estado == 1 : false
				),
				cursos: asistencias.filter((a) =>
					a ? a.estado != 0 && a.estado != 1 : false
				),
				acreditaciones: {
					cursos: $registrosCursos
						.filter((r) => r.id_acreditor == docente.id)
						.map((r) => {
							let cursoDiplomado = $cursos.find(
								(c) => c.id == r.id_curso
							);

							return {
								...r,
								curso: {
									...cursoDiplomado,
									diplomado: $diplomados.find((d) =>
										cursoDiplomado
											? d.id == cursoDiplomado.id_diplomado
											: false
									)
								}
							};
						}),
					diplomados: $registrosDiplomados
						.filter((r) => r.id_acreditor == docente.id)
						.map((r) => ({
							...r,
							diplomado: $diplomados.find(
								(d) => d.id == r.id_diplomado
							)
						})),
					competencias: $registrosCompetencias
						.filter((r) => r.id_acreditor == docente.id)
						.map((r) => {
							let competenciaEncontrada = $competencias.find(
								(c) => c.id == r.id_competencia
							);

							return {
								...r,
								competencia: {
									...competenciaEncontrada,
									tipo: $tiposCompetencias.find((t) =>
										competenciaEncontrada
											? t.id == competenciaEncontrada.id_tipo
											: false
									)
								}
							};
						})
				}
			};
		}
	);

	return store;
};
