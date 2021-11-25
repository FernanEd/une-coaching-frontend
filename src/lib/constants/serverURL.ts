export const serverURL =
	import.meta.env.MODE == 'development'
		? 'http://localhost:8000'
		: 'https://pacific-brushlands-15935.herokuapp.com';
