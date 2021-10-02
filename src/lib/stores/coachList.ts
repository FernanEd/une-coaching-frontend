import { derived } from 'svelte/store';
import { coaches, docentes, docentesEnCoaches, usuarios } from './db';

export const coachList = derived(
	[usuarios, coaches, docentes, docentesEnCoaches],
	([$usuarios, $coaches, $docentes, $docentesEnCoaches]) =>
		$coaches.map((coach) => ({
			...$usuarios.find((usuario) => usuario.id == coach.id_usuario),
			id_coach: coach.id,
			docentes: $docentesEnCoaches
				.filter(
					(docenteEnCoach) => docenteEnCoach.id_coach == coach.id
				)
				.map((docenteEnCoach) =>
					$docentes.find(
						(docente) => docente.id == docenteEnCoach.id_docente
					)
				)
				.map((docente) => ({
					...$usuarios.find(
						(usuario) => usuario.id == docente.id_usuario
					),
					id_docente: docente.id
				}))
		}))
);
