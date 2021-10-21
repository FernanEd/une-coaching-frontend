import { derived } from 'svelte/store';
import { competencias } from '../db/competencias';
import { tiposCompetencias } from '../db/tipoCompetencias';

export let competenciasList = derived(
	[competencias, tiposCompetencias],
	([$competencias, $tiposCompetencias]) =>
		$competencias.map((c) => ({
			...c,
			tipo: $tiposCompetencias.find((t) => t.id == c.id_tipo)
		}))
);
