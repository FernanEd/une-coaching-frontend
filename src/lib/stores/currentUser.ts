import type { JWT } from '$lib/utils/interfaces';
import { derived, writable } from 'svelte/store';
import type { UsuarioConRoles } from './lists/usuariosList';
import { userSession } from './userSession';

export const currentUser = writable<UsuarioConRoles>();
