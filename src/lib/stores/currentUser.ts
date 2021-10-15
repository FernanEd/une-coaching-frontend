import type { JWT } from '$lib/utils/interfaces';
import { derived } from 'svelte/store';
import { usuarioList } from './lists/usuariosList';
import { userSession } from './userSession';

export const currentUser = derived(
	[usuarioList, userSession],
	([$usuario, $userSession]) => {
		if (!$userSession.hasOwnProperty('userID')) return null;

		return $usuario.find((u) => u.id == ($userSession as JWT).userID);
	}
);
