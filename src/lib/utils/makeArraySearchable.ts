export const makeArraySearchable = <T>(
	array: T[],
	searchFields: (keyof T)[],
	searchText: string
) =>
	array.filter((elem) =>
		searchFields.some((f) => elem[f].toString().includes(searchText))
	);
