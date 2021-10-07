import { generateStore } from '$lib/utils/generateStore';
import type { Curso } from '$lib/utils/interfaces';

export let cursos = generateStore<Curso>('cursos');
