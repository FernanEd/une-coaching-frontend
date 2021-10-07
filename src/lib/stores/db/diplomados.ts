import { generateStore } from '$lib/utils/generateStore';
import type { Diplomado } from '$lib/utils/interfaces';

export let diplomados = generateStore<Diplomado>('diplomados');
