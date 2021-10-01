import { derived } from 'svelte/store';
import {
	administrativos,
	coaches,
	coordinadores,
	docentes,
	instructores,
	usuarios
} from './db';

const checkUserExists = (list: any[], value: any, rol: string) =>
	list.some((d) => d.id_usuario == value) ? rol : null;

export let usuarioList = derived(
	[
		usuarios,
		docentes,
		coaches,
		coordinadores,
		instructores,
		administrativos
	],
	([
		$usuarios,
		$docentes,
		$coaches,
		$coordinadores,
		$instructores,
		$administrativos
	]) =>
		$usuarios.map((user) => ({
			...user,
			roles: [
				checkUserExists($docentes, user.id, 'docente'),
				checkUserExists($coaches, user.id, 'coach'),
				checkUserExists($coordinadores, user.id, 'coordinador'),
				checkUserExists($instructores, user.id, 'instructor'),
				checkUserExists($administrativos, user.id, 'administrativo')
			].filter((v) => v)
		}))
);
