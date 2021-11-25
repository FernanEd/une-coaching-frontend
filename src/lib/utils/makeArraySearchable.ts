export const makeArraySearchable = <T>(
	array: T[],
	searchFields: (keyof T)[],
	searchText: string | undefined
) =>
	searchText
		? array.filter((elem) => {
				let fieldText = searchFields.reduce(
					(str, field) => (str += elem[field] + ' '),
					''
				);

				let searchWords = searchText.split(/\s/);

				return searchWords.some((word) =>
					fieldText.match(new RegExp(word, 'i'))
				);
		  })
		: array;
