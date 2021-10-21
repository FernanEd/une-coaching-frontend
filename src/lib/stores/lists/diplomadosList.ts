import { derived } from 'svelte/store';
import { cursos } from '../db/cursos';
import { diplomados } from '../db/diplomados';

export let diplomadosList = derived(
	[diplomados, cursos],
	([$diplomados, $cursos]) =>
		$diplomados.map((d) => ({
			...d,
			listaCursos: $cursos.filter(
				({ id_diplomado }) => id_diplomado == d.id
			)
		}))
);
