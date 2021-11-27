import type { Diplomado, RegistroDiplomado } from '$lib/utils/types/db';
import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { db_diplomados, db_registrosDiplomados } from '../db';
import { coordinadoresComoUsuario } from './coordinadoresComoUsuario';
import type { CoordinadorComoUsuario } from './coordinadoresComoUsuario';
import type { DocenteComoUsuario } from './docentesComoUsuario';
import { docentesComoUsuarios } from './docentesComoUsuario';

export interface RegistroDiplomadoConAcreditor extends RegistroDiplomado {
	diplomado: Diplomado;
	acreditor: DocenteComoUsuario;
	expeditor: CoordinadorComoUsuario;
}

export const registrosDiplomadoConAcreditor: Readable<
	RegistroDiplomadoConAcreditor[]
> = derived(
	[
		db_registrosDiplomados,
		db_diplomados,
		docentesComoUsuarios,
		coordinadoresComoUsuario,
	],
	([registrosDiplomados, diplomados, docentes, coordinadores]) =>
		registrosDiplomados
			.map((r) => {
				let diplomadoDelRegistro = diplomados.find(
					(d) => d.id == r.id_diplomado
				);
				let acreditorDelRegistro = docentes.find(
					(d) => d.id_docente == r.id_acreditor
				);
				let expeditorDelRegistro = coordinadores.find(
					(c) => c.id == r.id_expeditor
				);

				if (
					!(
						diplomadoDelRegistro &&
						acreditorDelRegistro &&
						expeditorDelRegistro
					)
				)
					return;

				return {
					...r,
					diplomado: diplomadoDelRegistro,
					acreditor: acreditorDelRegistro,
					expeditor: expeditorDelRegistro,
				};
			})
			.filter((r): r is RegistroDiplomadoConAcreditor => r != undefined)
);
