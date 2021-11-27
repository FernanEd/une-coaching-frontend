import type { Competencia, TipoCompetencia } from '$lib/utils/types/db';
import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { db_competencias, db_tiposCompetencias } from '../db';

export interface CompetenciaConTipo extends Competencia {
	tipo: TipoCompetencia | undefined;
}

export const competenciasConTipo: Readable<CompetenciaConTipo[]> = derived(
	[db_competencias, db_tiposCompetencias],
	([competencias, tipoCompetencias]) =>
		competencias.map((c) => {
			const tipoDeLaCompetencia = tipoCompetencias.find(
				(t) => t.id == c.id_tipo
			);

			return {
				...c,
				tipo: tipoDeLaCompetencia,
			};
		})
);
