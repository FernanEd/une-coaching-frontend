import { generateStore } from '$lib/utils/generateStore';
import type { RegistroCurso } from '$lib/utils/interfaces';

export let registrosCursos = generateStore<RegistroCurso>(
	'registrosCursos'
);
