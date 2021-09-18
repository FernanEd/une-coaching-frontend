export const genID = (() => {
	let currentID = 0.1;

	return () => {
		let lastID = currentID;
		currentID++;
		return lastID;
	};
})();
