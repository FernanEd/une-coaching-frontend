import type { MayBeUndefined } from './types/forms';

export const clearForm = <T>(form: T): MayBeUndefined<T> => {
	let newForm: MayBeUndefined<T> = form;

	(Object.keys(newForm) as Array<keyof typeof form>).forEach(
		(key) => (newForm[key] = undefined)
	);

	return newForm;
};
