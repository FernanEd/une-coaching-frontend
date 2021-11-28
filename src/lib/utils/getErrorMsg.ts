import { ApiError } from '$lib/stores/db/utils/getCRUD';

export const getErrorMsg = (e: unknown): string | undefined => {
	if (e instanceof ApiError) {
		let msg = e.message.split('invocation:\n\n\n')[1]?.trim();
		return msg;
	} else {
		if (e instanceof Error) return e.message;

		return;
	}
};
