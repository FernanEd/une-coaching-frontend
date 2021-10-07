import { generateStore } from '$lib/utils/generateStore';
import type { Instructor } from '$lib/utils/interfaces';

export let instructores = generateStore<Instructor>('instructores');
