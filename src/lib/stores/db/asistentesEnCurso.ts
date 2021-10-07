import { generateStore } from '$lib/utils/generateStore';
import type { AsistenteEnCurso } from '$lib/utils/interfaces';

export let asistentesEnCurso = generateStore<AsistenteEnCurso>(
	'asistentesEnCurso'
);
