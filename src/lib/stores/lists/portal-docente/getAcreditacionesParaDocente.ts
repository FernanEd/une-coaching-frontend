import {
	db_asistentesEnCurso,
	db_diplomados,
	db_registrosCompetencias,
	db_registrosCursos,
	db_registrosDiplomados,
} from '$lib/stores/db';
import type { Diplomado } from '$lib/utils/types/db';
import { derived } from 'svelte/store';
import type { CompetenciaConTipo } from '../competenciasConTipo';
import { competenciasConTipo } from '../competenciasConTipo';
import { cursosConDiplomado } from '../cursosConDiplomado';
import type { CursoConDiplomado } from '../cursosConDiplomado';
import { docentesComoUsuarios } from '../docentesComoUsuario';
import { asistentesEnCursoConfirmados } from '../jornada/asistentesEnCursoConfirmados';
import { cursosEnJornadaConInstructorConCurso } from '../jornada/cursosEnJornadaConInstructorConCurso';

export interface AcreditacionCurso extends CursoConDiplomado {
	documento: string | undefined;
}

export interface AcreditacionDiplomado extends Diplomado {
	documento: string | undefined;
}

export interface AcreditacionCompetencia extends CompetenciaConTipo {
	documento: string | undefined;
}

export interface Acreditaciones {
	cursos: AcreditacionCurso[];
	diplomados: AcreditacionDiplomado[];
	competencias: AcreditacionCompetencia[];
}

export const getAcreditacionesParaDocente = (docenteID: number) =>
	docenteID
		? derived(
				[
					cursosConDiplomado,
					db_diplomados,
					competenciasConTipo,
					db_registrosCursos,
					db_registrosDiplomados,
					db_registrosCompetencias,
					asistentesEnCursoConfirmados,
					cursosEnJornadaConInstructorConCurso,
					docentesComoUsuarios,
				],
				([
					cursos,
					diplomados,
					competencias,
					registrosCursos,
					registrosDiplomados,
					registrosCompetencias,
					asistentes,
					cursosEnJornada,
					docentes,
				]) => {
					const docente = docentes.find((d) => d.id_docente == docenteID);
					if (!docente) return;

					const cursosAcreditados: AcreditacionCurso[] = cursos
						.map((c) => {
							let cursosEnJornadaConEsteCurso = cursosEnJornada.filter(
								(cJ) => cJ.curso.id == c.id
							);

							let asistenciaCursadaAprobadaExistente = asistentes.find(
								(a) =>
									cursosEnJornadaConEsteCurso
										.map((cJ) => cJ.id)
										.includes(a.id_cursojornada) &&
									a.id_docente == docenteID &&
									a.aprobado &&
									a.cursado
							);

							if (!asistenciaCursadaAprobadaExistente) return;

							let registroCursoExistente = registrosCursos.find(
								(r) => r.id_acreditor == docenteID && r.id_curso == c.id
							);

							return {
								...c,
								documento: registroCursoExistente?.documento,
							};
						})
						.filter((c): c is AcreditacionCurso => c != undefined);

					const diplomadosAcreditados: AcreditacionDiplomado[] = diplomados
						.map((d) => {
							let registroDiplomadoExistente = registrosDiplomados.find(
								(r) => r.id_acreditor == docenteID && r.id_diplomado == d.id
							);

							if (!registroDiplomadoExistente) return;

							return {
								...d,
								documento:
									registroDiplomadoExistente.documento == null
										? undefined
										: registroDiplomadoExistente.documento,
							};
						})
						.filter((d): d is AcreditacionDiplomado => d != undefined);

					const competenciasAcreditadas: AcreditacionCompetencia[] =
						competencias
							.map((c) => {
								let registroCompetenciaExistente = registrosCompetencias.find(
									(r) => r.id_acreditor == docenteID && r.id_competencia == c.id
								);

								if (!registroCompetenciaExistente) return;

								return {
									...c,
									documento:
										registroCompetenciaExistente.documento == null
											? undefined
											: registroCompetenciaExistente.documento,
								};
							})
							.filter((c): c is AcreditacionCompetencia => c != undefined);

					let acreditacionesDelDocente: Acreditaciones = {
						cursos: cursosAcreditados,
						diplomados: diplomadosAcreditados,
						competencias: competenciasAcreditadas,
					};

					return acreditacionesDelDocente;
				}
		  )
		: undefined;
