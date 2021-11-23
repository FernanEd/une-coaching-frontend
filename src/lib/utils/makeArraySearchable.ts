export const makeArraySearchable = <T>(
	array: T[],
	searchFields: (keyof T)[],
	searchText: string | undefined
) =>
	array.filter((elem) => {
		let fieldText = searchFields.reduce(
			(str, field) => (str += elem[field] + ' '),
			''
		);

		return fieldText.match(new RegExp(searchText, 'i'))
			? true
			: false;
	});
