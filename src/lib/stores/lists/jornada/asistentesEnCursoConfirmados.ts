import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { AsistenteEnCurso } from '$lib/utils/types/db';
import { docentesComoUsuarios } from '../docentesComoUsuario';
import type { DocenteComoUsuario } from '../docentesComoUsuario';
import { db_asistentesEnCurso } from '$lib/stores/db';

export interface AsistenteEnCursoConfirmado extends AsistenteEnCurso {
	docente: DocenteComoUsuario;
}

export const asistentesEnCursoConfirmados: Readable<
	AsistenteEnCursoConfirmado[]
> = derived(
	[db_asistentesEnCurso, docentesComoUsuarios],
	([asistentes, docentes]) =>
		asistentes
			.map((a) => {
				const docenteAsistente = docentes.find(
					(d) => d.id_docente == a.id_docente
				);

				if (!docenteAsistente) return;

				return {
					...a,
					docente: docenteAsistente,
				};
			})
			.filter((a): a is AsistenteEnCursoConfirmado => a != undefined)
);
