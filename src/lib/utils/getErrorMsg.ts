import type { ApiError } from '$lib/stores/db/utils/getCRUD';

export const getErrorMsg = (e: unknown): string | undefined => {
	if (typeof e == 'object' && e !== null) {
		let msg = (e as ApiError).message.split('invocation:\n\n\n')[1].trim();
		return msg;
	} else {
		return;
	}
};
