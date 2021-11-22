export const makeArraySearchable = <T>(
	array: T[],
	searchFields: (keyof T)[],
	searchText: string
) =>
	array.filter((elem) =>
		searchText
			? searchFields.some((f) =>
					elem[f]
						.toString()
						.toLowerCase()
						.includes(searchText.toLowerCase())
			  )
			: true
	);
