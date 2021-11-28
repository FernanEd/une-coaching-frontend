import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { docentesComoUsuarios } from '../docentesComoUsuario';
import type { DocenteComoUsuario } from '../docentesComoUsuario';
import type { InvitacionCurso } from '$lib/utils/types/db';
import { db_invitacionesCurso } from '$lib/stores/db';

export interface InvitacionCursoConDocente extends InvitacionCurso {
	docente: DocenteComoUsuario;
}

export const invitacionesCursoConDocente: Readable<
	InvitacionCursoConDocente[]
> = derived(
	[db_invitacionesCurso, docentesComoUsuarios],
	([invitaciones, docentes]) =>
		invitaciones
			.map((i) => {
				const docenteInvitado = docentes.find(
					(d) => d.id_docente == i.id_docente
				);

				if (!docenteInvitado) return;

				return {
					...i,
					docente: docenteInvitado,
				};
			})
			.filter((i): i is InvitacionCursoConDocente => i != undefined)
);
