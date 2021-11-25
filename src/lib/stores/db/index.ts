import type { Curso } from '$lib/utils/types/db';
import { readable } from 'svelte/store';
import { makeDBStore } from './utils/makeDBStore';

export const cursos = makeDBStore<Curso>('cursos');
