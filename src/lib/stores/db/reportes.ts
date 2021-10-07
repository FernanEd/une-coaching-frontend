import { generateStore } from '$lib/utils/generateStore';
import type { Reporte } from '$lib/utils/interfaces';

export let reportes = generateStore<Reporte>('reportes');
