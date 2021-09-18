import type { Writable } from 'svelte/store';
import { genID } from './genID';
import { serverURL } from './serverURL';

// export const getElements = async <T extends { id: number }>(route: string, elementStore: Writable<T[]>) => {
// 	let elementList = elementStore.;
// 	try {
// 		let res = await fetch(`${serverURL}/${route}`);
// 		let data = await res.json();
// 		elementList = data;
// 	} catch (e) {
// 		throw Error(e);
// 	}finally{
// 		elementStore.set(elementList);
// 	}
// };

// export const addElement = async <T>(
// 	element: T,
// 	elementList: ({ id: number } & T)[],
// 	route: string
// ) => {
// 	let newElement = {
// 		id: genID(),
// 		...element
// 	};

// 	elementList = [...elementList, newElement];

// 	try {
// 		let res = await fetch(`${serverURL}/${route}`, {
// 			method: 'POST',
// 			body: JSON.stringify(element),
// 			headers: {
// 				'Content-type': 'application/json'
// 			}
// 		});
// 		let data = await res.json();
// 		elementList = elementList.map((elem) => (elem.id === newElement.id ? data : elem));
// 	} catch (e) {
// 		elementList = elementList.filter((elem) => elem.id !== newElement.id);
// 		throw Error(e);
// 	}
// };

// export const updateElement = async <T extends { id: number }>(
// 	elementID: number,
// 	element: T,
// 	elementList: T[],
// 	route: string
// ) => {
// 	//note im not copying this list
// 	let oldElementList = elementList;
// 	let newElement = { ...element };
// 	elementList = elementList.map((elem) => (elem.id == newElement.id ? newElement : elem));
// 	try {
// 		//To prevent overriding id
// 		delete newElement.id;
// 		let res = await fetch(`${serverURL}/${route}/${elementID}`, {
// 			method: 'PUT',
// 			body: JSON.stringify(newElement),
// 			headers: {
// 				'Content-type': 'application/json'
// 			}
// 		});
// 		await res.json();
// 	} catch (e) {
// 		elementList = oldElementList;
// 		throw Error(e);
// 	}
// };

// export const deleteElement = async <T extends { id: number }>(
// 	elementID: number,
// 	elementList: T[],
// 	route: string
// ) => {
// 	let oldElementList = elementList;
// 	elementList = elementList.filter((elem) => elem.id != elementID);
// 	try {
// 		let res = await fetch(`${serverURL}/${route}/${elementID}`, {
// 			method: 'DELETE'
// 		});
// 		await res.json();
// 	} catch (e) {
// 		elementList = oldElementList;
// 		throw Error(e);
// 	}
// };
