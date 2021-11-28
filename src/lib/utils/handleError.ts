import { toasts } from '$lib/stores/toasts';
import { capitalizeString } from './capitalizeString';
import { getErrorMsg } from './getErrorMsg';

export const handleError = (e: unknown): void => {
	let msg = getErrorMsg(e);
	if (msg) {
		if (/^Unique constraint/.test(msg)) {
			let campos = msg
				.split('fields: ')
				.slice(-1)[0]
				.split('`')
				.filter((str) => {
					str = str.trim();
					return str != '(' && str != ',' && str != ')';
				})
				.map((str) => capitalizeString(str.replace('id_', '')))
				.join(', ');
			toasts.error(
				`Ya existe un registro con los mismos valores en los campos: ${campos}`
			);
		} else {
			toasts.error(msg);
		}
	} else {
		toasts.error();
	}
};
