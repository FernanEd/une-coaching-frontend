import { generateStore } from '$lib/utils/generateStore';
import type { Administrativo } from '$lib/utils/interfaces';

export let administrativos = generateStore<Administrativo>(
	'administrativos'
);
