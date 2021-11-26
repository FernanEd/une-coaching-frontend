export const noUndefinedValues = <T>(
	obj: T
): obj is { [K in keyof T]: NonNullable<T[K]> } => {
	return Object.values(obj).every((v) => v != null);
};
