import { generateStore } from '$lib/utils/generateStore';
import { Curso, Usuario } from '$lib/utils/interfaces';

export const usuario = generateStore<Usuario>('usuario');
export const curso = generateStore<Curso>('curso');
