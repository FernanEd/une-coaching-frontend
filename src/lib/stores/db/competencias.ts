import { generateStore } from '$lib/utils/generateStore';
import type { Competencia } from '$lib/utils/interfaces';

export let competencias = generateStore<Competencia>('competencias');
