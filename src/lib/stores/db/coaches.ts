import { generateStore } from '$lib/utils/generateStore';
import type { Coach } from '$lib/utils/interfaces';

export let coaches = generateStore<Coach>('coaches');
