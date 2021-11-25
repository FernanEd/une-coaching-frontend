import type { userSession } from '$lib/utils/types/session';
import type { GetSession } from '@sveltejs/kit';
import cookie from 'cookie';

export const getSession: GetSession = ({ headers }) => {
	let session: userSession | undefined = getCookie(
		'access_token',
		headers.cookie
	);

	return {
		isLoggedIn: session ? true : false,
		...session,
	};
};

const getCookie = (name: string, cookieStr: string) => {
	if (!cookieStr) return;
	let parsed = cookie.parse(cookieStr);
	let str = parsed[name]?.substr(2);
	try {
		let data = JSON.parse(str);
		return data;
	} catch (e) {
		console.error(e);
		return;
	}
};
