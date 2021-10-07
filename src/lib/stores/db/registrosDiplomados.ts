import { generateStore } from '$lib/utils/generateStore';
import type { RegistroDiplomado } from '$lib/utils/interfaces';

export let registrosDiplomados = generateStore<RegistroDiplomado>(
	'registrosDiplomados'
);
