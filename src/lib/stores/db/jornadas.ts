import { generateStore } from '$lib/utils/generateStore';
import type { Jornada } from '$lib/utils/interfaces';

export let jornadas = generateStore<Jornada>('jornadas');
