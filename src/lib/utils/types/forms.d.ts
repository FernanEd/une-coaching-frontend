export type MayBeUndefined<T> = {
	[Property in keyof T]: T[Property] | undefined;
};
