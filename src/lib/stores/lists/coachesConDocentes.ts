import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { db_docentesEnCoaches } from '../db';
import { coachesComoUsuarios } from './coachesComoUsuario';
import { docentesComoUsuarios } from './docentesComoUsuario';

import type { CoachComoUsuario } from './coachesComoUsuario';
import type { DocenteComoUsuario } from './docentesComoUsuario';

interface CoachConDocentes extends CoachComoUsuario {
	docentes: DocenteComoUsuario[];
}

export const coachesConDocentes: Readable<CoachConDocentes[]> = derived(
	[coachesComoUsuarios, docentesComoUsuarios, db_docentesEnCoaches],
	([coaches, docentes, docentesEnCoaches]) =>
		coaches.map((c) => {
			const docentesEnEsteCoach = docentesEnCoaches.filter(
				(r) => r.id_coach == c.id_coach
			);

			return {
				...c,
				docentes: docentesEnEsteCoach
					.map((r) => {
						const docente = docentes.find((d) => d.id_docente == r.id_docente);
						if (!docente) return;

						return docente;
					})
					.filter((r): r is DocenteComoUsuario => r != undefined),
			};
		})
);
