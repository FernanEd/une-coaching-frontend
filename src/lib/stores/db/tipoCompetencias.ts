import { generateStore } from '$lib/utils/generateStore';
import type {
	Competencia,
	TipoCompetencia
} from '$lib/utils/interfaces';

export let tipoCompetencia = generateStore<TipoCompetencia>(
	'tipoCompetencia'
);
