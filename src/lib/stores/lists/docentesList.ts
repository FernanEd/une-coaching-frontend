import type { Usuario } from '$lib/utils/interfaces';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import { docentes } from '../db/docentes';
import { usuarios } from '../db/usuarios';

export type DocenteEntrada = Usuario & { id_docente: number };

export const docentesList: Readable<DocenteEntrada[]> = derived(
	[docentes, usuarios],
	([$docentes, $usuarios]) =>
		$docentes
			.map((d) => {
				let user = $usuarios.find((u) => u.id == d.id_usuario);

				if (!user) return;

				return {
					...user,
					id_docente: d.id
				};
			})
			.filter((d) => d)
);
