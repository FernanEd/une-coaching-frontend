import type { RegistroCompetencia } from '$lib/utils/types/db';
import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { db_registrosCompetencias } from '../db';
import { coordinadoresComoUsuario } from './coordinadoresComoUsuario';
import type { CoordinadorComoUsuario } from './coordinadoresComoUsuario';
import type { DocenteComoUsuario } from './docentesComoUsuario';
import { docentesComoUsuarios } from './docentesComoUsuario';
import { competenciasConTipo } from './competenciasConTipo';
import type { CompetenciaConTipo } from './competenciasConTipo';

export interface RegistroCompetenciaConAcreditor extends RegistroCompetencia {
	competencia: CompetenciaConTipo;
	acreditor: DocenteComoUsuario;
	expeditor: CoordinadorComoUsuario;
}

export const registrosCompetenciaConAcreditor: Readable<
	RegistroCompetenciaConAcreditor[]
> = derived(
	[
		db_registrosCompetencias,
		competenciasConTipo,
		docentesComoUsuarios,
		coordinadoresComoUsuario,
	],
	([registrosDiplomados, competencias, docentes, coordinadores]) =>
		registrosDiplomados
			.map((r) => {
				let competenciaDelRegistro = competencias.find(
					(c) => c.id == r.id_competencia
				);
				let acreditorDelRegistro = docentes.find(
					(d) => d.id_docente == r.id_acreditor
				);
				let expeditorDelRegistro = coordinadores.find(
					(c) => c.id_coordinador == r.id_expeditor
				);

				if (
					!(
						competenciaDelRegistro &&
						acreditorDelRegistro &&
						expeditorDelRegistro
					)
				)
					return;

				return {
					...r,
					competencia: competenciaDelRegistro,
					acreditor: acreditorDelRegistro,
					expeditor: expeditorDelRegistro,
				};
			})
			.filter((r): r is RegistroCompetenciaConAcreditor => r != undefined)
);
