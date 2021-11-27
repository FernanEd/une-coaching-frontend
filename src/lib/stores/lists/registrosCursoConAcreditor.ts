import type { RegistroCurso } from '$lib/utils/types/db';
import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { db_registrosCursos } from '../db';
import { coordinadoresComoUsuario } from './coordinadoresComoUsuario';
import type { CoordinadorComoUsuario } from './coordinadoresComoUsuario';
import type { DocenteComoUsuario } from './docentesComoUsuario';
import { docentesComoUsuarios } from './docentesComoUsuario';
import type { CursoConDiplomado } from './cursosConDiplomado';
import { cursosConDiplomado } from './cursosConDiplomado';

export interface RegistroCursoConAcreditor extends RegistroCurso {
	curso: CursoConDiplomado;
	acreditor: DocenteComoUsuario;
	expeditor: CoordinadorComoUsuario;
}

export const registrosCursoConAcreditor: Readable<RegistroCursoConAcreditor[]> =
	derived(
		[
			db_registrosCursos,
			cursosConDiplomado,
			docentesComoUsuarios,
			coordinadoresComoUsuario,
		],
		([registrosCursos, cursos, docentes, coordinadores]) =>
			registrosCursos
				.map((r) => {
					let cursoDelRegistro = cursos.find((c) => c.id == r.id_curso);
					let acreditorDelRegistro = docentes.find(
						(d) => d.id == r.id_acreditor
					);
					let expeditorDelRegistro = coordinadores.find(
						(c) => c.id == r.id_expeditor
					);

					if (
						!(cursoDelRegistro && acreditorDelRegistro && expeditorDelRegistro)
					)
						return;

					return {
						...r,
						curso: cursoDelRegistro,
						acreditor: acreditorDelRegistro,
						expeditor: expeditorDelRegistro,
					};
				})
				.filter((r): r is RegistroCursoConAcreditor => r != undefined)
	);
