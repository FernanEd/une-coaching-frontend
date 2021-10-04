import type { Usuario } from '$lib/utils/interfaces';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import { docentes, usuarios } from './db';

export type DocenteEntrada = Usuario & { id_docente: number };

export const docentesList: Readable<DocenteEntrada[]> = derived(
	[docentes, usuarios],
	([$docentes, $usuarios]) =>
		$docentes.map((d) => ({
			...$usuarios.find((u) => u.id == d.id_usuario),
			id_docente: d.id
		}))
);
