import { toasts } from '$lib/stores/toasts';
import { getErrorMsg } from './getErrorMsg';

export const handleError = (e: unknown): void => {
	let msg = getErrorMsg(e);
	if (msg) {
		toasts.error(msg);
	} else {
		toasts.error();
	}
};
