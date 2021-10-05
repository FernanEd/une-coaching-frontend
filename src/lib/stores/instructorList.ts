import type { Usuario } from '$lib/utils/interfaces';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import { docentes, instructores, usuarios } from './db';

export type InstructorEntrada = Usuario & { id_instructor: number };

export const instructoresList: Readable<
	InstructorEntrada[]
> = derived([instructores, usuarios], ([$instructores, $usuarios]) =>
	$instructores.map((i) => ({
		...$usuarios.find((u) => u.id == i.id_usuario),
		id_instructor: i.id
	}))
);
