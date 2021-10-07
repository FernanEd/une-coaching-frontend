import { generateStore } from '$lib/utils/generateStore';
import type { RegistroCompetencia } from '$lib/utils/interfaces';

export let registrosCompetencias = generateStore<RegistroCompetencia>(
	'registrosCompetencias'
);
