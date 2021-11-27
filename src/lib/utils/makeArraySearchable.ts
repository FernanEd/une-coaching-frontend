export const parseAccents = (word: string) =>
	word
		.replace('á', 'a')
		.replace('é', 'e')
		.replace('í', 'i')
		.replace('ó', 'o')
		.replace('ú', 'u');

export const makeArraySearchable = <T>(
	array: T[],
	searchFields: (keyof T)[],
	searchText: string | undefined
) =>
	searchText
		? array.filter((elem) => {
				let fieldText = parseAccents(
					searchFields.reduce((str, field) => (str += elem[field] + ' '), '')
				);

				let searchWords = searchText.split(/\s/);

				return searchWords.every((word) =>
					fieldText.match(new RegExp(parseAccents(word), 'i'))
				);
		  })
		: array;
