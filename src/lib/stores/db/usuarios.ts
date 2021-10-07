import { generateStore } from '$lib/utils/generateStore';
import type { Usuario } from '$lib/utils/interfaces';

export let usuarios = generateStore<Usuario>('usuarios');
