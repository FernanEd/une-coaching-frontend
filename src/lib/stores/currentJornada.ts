import type { Jornada } from '$lib/utils/interfaces';
import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { jornadas } from './db/jornadas';
import dayjs from 'dayjs';

export const currentJornada: Readable<Jornada> = derived(
	[jornadas],
	([$jornadas]) =>
		$jornadas.reduce((j1, j2) => {
			return dayjs(j1.fecha_inicio).isAfter(dayjs(j2.fecha_inicio))
				? j1
				: j2;
		}, $jornadas[0])
);
