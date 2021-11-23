import type { Docente, Usuario } from '$lib/utils/interfaces';
import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { coaches } from '../db/coaches';
import { docentes } from '../db/docentes';
import { docentesEnCoaches } from '../db/docentesEnCoaches';
import { usuarios } from '../db/usuarios';

export type DocenteComoUsuario = Usuario & {
	id_docente: number;
	id_docenteEnCoach: number;
};
export type CoachConDocentes = Usuario & { id_coach: number } & {
	docentes: DocenteComoUsuario[];
};

export const coachList: Readable<CoachConDocentes[]> = derived(
	[usuarios, coaches, docentes, docentesEnCoaches],
	([$usuarios, $coaches, $docentes, $docentesEnCoaches]) =>
		$coaches
			.map((coach) => {
				let user = $usuarios.find(
					(usuario) => usuario.id == coach.id_usuario
				);

				if (!user) return;

				return {
					...user,
					id_coach: coach.id,
					docentes: $docentesEnCoaches
						.filter(
							(docenteEnCoach) => docenteEnCoach.id_coach == coach.id
						)
						.map((docenteEnCoach) => ({
							...$docentes.find(
								(docente) => docente.id == docenteEnCoach.id_docente
							),
							id_docenteEnCoach: docenteEnCoach.id
						}))
						.map((docente) => ({
							...$usuarios.find(
								(usuario) => usuario.id == docente.id_usuario
							),
							id_docente: docente.id,
							id_docenteEnCoach: docente.id_docenteEnCoach
						}))
				};
			})
			.filter((c) => c)
);
