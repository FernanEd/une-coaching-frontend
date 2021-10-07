import { generateStore } from '$lib/utils/generateStore';
import type { Coordinador } from '$lib/utils/interfaces';

export let coordinadores = generateStore<Coordinador>(
	'coordinadores'
);
