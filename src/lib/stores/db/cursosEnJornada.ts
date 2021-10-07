import { generateStore } from '$lib/utils/generateStore';
import type { CursoEnJornada } from '$lib/utils/interfaces';

export let cursosEnJornada = generateStore<CursoEnJornada>(
	'cursosEnJornada'
);
