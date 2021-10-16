import type {
	AsistenteEnCurso,
	Jornada,
	CursoEnJornada,
	Usuario,
	Curso
} from '$lib/utils/interfaces';
import { derived, writable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { asistentesEnCurso } from '../db/asistentesEnCurso';
import { cursos } from '../db/cursos';
import { cursosEnJornada } from '../db/cursosEnJornada';
import { docentes } from '../db/docentes';
import { instructores } from '../db/instructores';
import { jornadas } from '../db/jornadas';
import { usuarios } from '../db/usuarios';

type InstructorDeCurso = Usuario & { id_instructor: number };
export type AsistenteDeCurso = AsistenteEnCurso & {
	docente: Usuario & { id_docente: number };
};
type CursosConAsistentesInstructores = CursoEnJornada & {
	instructor: InstructorDeCurso;
	curso: Curso;
	asistentes: AsistenteDeCurso[];
};
export type JornadaConCursos = Jornada & {
	cursos: CursosConAsistentesInstructores[];
};

export const store_jornadaSeleccionada = writable<number>();

export const seleccionarJornada = (
	jornadaID: number
): Readable<JornadaConCursos> | undefined => {
	if (!jornadaID) return;
	let jornada: Readable<JornadaConCursos> = derived(
		[
			jornadas,
			cursosEnJornada,
			cursos,
			asistentesEnCurso,
			usuarios,
			instructores,
			docentes
		],
		([
			$jornadas,
			$cursosEnJornada,
			$cursos,
			$asistentesEnCurso,
			$usuarios,
			$instructores,
			$docentes
		]) => {
			let jornadaEncontrada = $jornadas.find(
				(j) => j.id == jornadaID
			);
			if (!jornadaEncontrada) return;

			return {
				...jornadaEncontrada,
				cursos: $cursosEnJornada
					.filter((c) => c.id_jornada == jornadaID)
					.map((c) => ({
						...c,
						instructor: {
							...$usuarios.find(
								(u) =>
									u.id ==
									$instructores.find((i) => i.id == c.id_instructor)
										.id_usuario
							),
							id_instructor: c.id_instructor
						},
						curso: $cursos.find((curso) => curso.id == c.id_curso),
						asistentes: $asistentesEnCurso
							.filter((a) => a.id_cursojornada == c.id)
							.map((a) => ({
								...a,
								docente: {
									...$usuarios.find(
										(u) =>
											u.id ==
											$docentes.find((d) => d.id == a.id_docente)
												.id_usuario
									),
									id_docente: a.id_docente
								}
							}))
					}))
			};
		}
	);
	return jornada;
};
