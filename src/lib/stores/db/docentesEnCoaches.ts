import { generateStore } from '$lib/utils/generateStore';
import type { DocentesEnCoaches } from '$lib/utils/interfaces';

export let docentesEnCoaches = generateStore<DocentesEnCoaches>(
	'docentesEnCoaches'
);
