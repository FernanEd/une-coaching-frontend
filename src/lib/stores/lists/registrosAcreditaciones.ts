import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { registrosCompetenciaConAcreditor } from './registrosCompetenciaConAcreditor';
import { registrosCursoConAcreditor } from './registrosCursoConAcreditor';
import { registrosDiplomadoConAcreditor } from './registrosDiplomadoConAcreditor';
import type { RegistroCompetenciaConAcreditor } from './registrosCompetenciaConAcreditor';
import type { RegistroCursoConAcreditor } from './registrosCursoConAcreditor';
import type { RegistroDiplomadoConAcreditor } from './registrosDiplomadoConAcreditor';

type RegistroCompetenciaClasificado = RegistroCompetenciaConAcreditor & {
	tipo: 'competencia';
};
type RegistroCursoClasificado = RegistroCursoConAcreditor & { tipo: 'curso' };
type RegistroDiplomadoClasificado = RegistroDiplomadoConAcreditor & {
	tipo: 'diplomado';
};

export type RegistroAcreditacion =
	| RegistroCompetenciaClasificado
	| RegistroCursoClasificado
	| RegistroDiplomadoClasificado;

export const registrosAcreditaciones: Readable<RegistroAcreditacion[]> =
	derived(
		[
			registrosCursoConAcreditor,
			registrosCompetenciaConAcreditor,
			registrosDiplomadoConAcreditor,
		],
		([cursos, competencias, diplomados]) => [
			...cursos.map((c): RegistroCursoClasificado => ({ ...c, tipo: 'curso' })),
			...competencias.map(
				(c): RegistroCompetenciaClasificado => ({ ...c, tipo: 'competencia' })
			),
			...diplomados.map(
				(d): RegistroDiplomadoClasificado => ({ ...d, tipo: 'diplomado' })
			),
		]
	);
