import { ApiError } from '$lib/stores/db/utils/getCRUD';
import { capitalizeString } from './capitalizeString';

export const getErrorMsg = (e: unknown): string | undefined => {
	if (e instanceof ApiError) {
		let campos = e.message
			.split('Unique constraint failed on the fields: ')
			.slice(-1)[0]
			.split('`')
			.filter((str) => {
				str = str.trim();
				return str != '(' && str != ',' && str != ')';
			})
			.map((str) => capitalizeString(str.replace('id_', '')))
			.join(', ');
		return `Ya existe un registro con los mismos valores en los campos: ${campos}`;
	} else {
		if (e instanceof Error) return e.message;

		return;
	}
};
