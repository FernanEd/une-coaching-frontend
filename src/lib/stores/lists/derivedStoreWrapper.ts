import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';

/** One or more `Readable`s. */
declare type Stores =
	| Readable<any>
	| [Readable<any>, ...Array<Readable<any>>]
	| Array<Readable<any>>;
/** One or more values from `Readable` stores. */
declare type StoresValues<T> = T extends Readable<infer U>
	? U
	: {
			[K in keyof T]: T[K] extends Readable<infer U> ? U : never;
	  };
/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @param stores - input stores
 * @param fn - function callback that aggregates the values
 */

type storeWrapper = <S extends Stores, T>(
	stores: S,
	fn: (values: StoresValues<S>) => T
) => Readable<T | undefined>;

export const makeStoreWrapper: storeWrapper = (stores, fn) =>
	derived(stores, (values) => {
		let loading = true;
		let timesLoaded = 0;

		//@ts-ignore
		let timesToLoad = stores.length - 1;

		//@ts-ignore
		stores.forEach((s) =>
			s.getItems().then(() => {
				timesLoaded++;
				if (timesLoaded == timesToLoad) loading = false;
			})
		);

		if (loading) return;

		return fn(values);
	});
