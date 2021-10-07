import { generateStore } from '$lib/utils/generateStore';
import type { Docente } from '$lib/utils/interfaces';

export let docentes = generateStore<Docente>('docentes');
