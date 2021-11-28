import { derived } from 'svelte/store';
import { cursosEnJornadaConAsistentes } from '../jornada/cursosEnJornadaConAsistentes';
import type { Readable } from 'svelte/store';
import type { CursoEnJornadaConAsistentes } from '../jornada/cursosEnJornadaConAsistentes';
import { jornadaActual } from '../jornada/jornadaActual';
import { cursosEnJornadaConInvitaciones } from '../jornada/cursosEnJornadaConInvitaciones';

export const cursosParaInscribir = derived(
	[cursosEnJornadaConInvitaciones, jornadaActual],
	([cursos, jornadaActual]) =>
		cursos.filter((c) => c.id_jornada == jornadaActual.id)
);
