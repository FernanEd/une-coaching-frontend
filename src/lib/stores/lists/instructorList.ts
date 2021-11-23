import type { Usuario } from '$lib/utils/interfaces';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import { instructores } from '../db/instructores';
import { usuarios } from '../db/usuarios';

export type InstructorEntrada = Usuario & { id_instructor: number };

export const instructoresList: Readable<
	InstructorEntrada[]
> = derived([instructores, usuarios], ([$instructores, $usuarios]) =>
	$instructores
		.filter((i) => i)
		.map((i) => {
			let usuario = $usuarios.find((u) => u.id == i.id_usuario);

			if (!usuario) return;

			return {
				...usuario,
				id_instructor: i.id
			};
		})
);
