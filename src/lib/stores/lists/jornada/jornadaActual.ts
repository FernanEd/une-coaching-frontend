import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import dayjs from 'dayjs';
import { db_jornadas } from '$lib/stores/db';
import type { Jornada } from '$lib/utils/types/db';

export const jornadaActual: Readable<Jornada | undefined> = derived(
	[db_jornadas],
	([jornadas]) => {
		if (jornadas.length == 0) return undefined;

		return jornadas.reduce((j1, j2) => {
			return dayjs(j1.fecha_inicio).isAfter(dayjs(j2.fecha_inicio)) ? j1 : j2;
		}, jornadas[0]);
	}
);
