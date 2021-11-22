import { goto } from '$app/navigation';
import { currentUser } from '$lib/stores/currentUser';
import { usuarioList } from '$lib/stores/lists/usuariosList';
import { userSession } from '$lib/stores/userSession';
import type { JWT } from './interfaces';

export const logIn = (jwt: JWT) => {
	localStorage.setItem('jwt', JSON.stringify(jwt));
	userSession.set(jwt);

	currentUser.set({
		id: jwt.userID,
		roles: jwt.roles.map((rol, i) => ({ id: i, rol })),
		matricula: 0,
		nombre: '',
		apellido_paterno: '',
		apellido_materno: '',
		correo: '',
		password: ''
	});

	usuarioList.subscribe((usuarios) => {
		let usuario = usuarios.find((u) => u.id == jwt.userID);

		if (usuario) {
			currentUser.set(usuario);
		}
	});
};

export const logOut = () => {
	localStorage.removeItem('jwt');
	userSession.set({
		roles: [],
		token: '',
		userID: 0
	});
	currentUser.set(null);
	goto('/login');
};
