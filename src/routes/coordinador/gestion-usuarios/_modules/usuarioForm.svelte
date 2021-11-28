<script lang="ts">
	import { session } from '$app/stores';

	import {
		db_administrativos,
		db_coaches,
		db_coordinadores,
		db_docentes,
		db_instructores,
		db_usuarios,
	} from '$lib/stores/db';
	import { ApiError } from '$lib/stores/db/utils/getCRUD';
	import type { UsuarioConRoles } from '$lib/stores/lists/usuariosConRoles';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toasts';
	import { clearForm } from '$lib/utils/clearForm';
	import { getErrorMsg } from '$lib/utils/getErrorMsg';
	import { noUndefinedValues } from '$lib/utils/noUndefinedValues';
	import type { Usuario } from '$lib/utils/types/db';
	import type { MayBeUndefined } from '$lib/utils/types/forms';

	export let editingUsuario: UsuarioConRoles | undefined = undefined;
	export let form: MayBeUndefined<Omit<Usuario, 'id'>> = {
		matricula: undefined,
		nombre: undefined,
		apellido_paterno: undefined,
		apellido_materno: undefined,
		correo: undefined,
		password: undefined,
	};
	export let rolesSeleccionados: (
		| 'docente'
		| 'coordinador'
		| 'instructor'
		| 'administrativo'
		| 'coach'
	)[] = [];
	let rolesIniciales = rolesSeleccionados;

	const roles = {
		docente: db_docentes,
		coach: db_coaches,
		administrativo: db_administrativos,
		instructor: db_instructores,
		coordinador: db_coordinadores,
	};

	const handleSubmit = async () => {
		const formData = { ...form };
		const rolesList = [...rolesSeleccionados];

		if (noUndefinedValues(formData)) {
			if (editingUsuario) {
				let rolesNuevos = rolesSeleccionados.filter(
					(rol) => !rolesIniciales.includes(rol)
				);
				let rolesDesmarcados = rolesIniciales.filter(
					(rol) => !rolesSeleccionados.includes(rol)
				);

				//@ts-ignore
				delete formData.password;
				try {
					let updatedUser = await db_usuarios.updateItem(
						editingUsuario.id,
						formData
					);

					if (rolesNuevos.length > 0) {
						for (let rol of rolesNuevos) {
							if (roles.hasOwnProperty(rol)) {
								await roles[rol].addItem({
									id_usuario: updatedUser.id,
								});
							}
						}
					}

					if (rolesDesmarcados.length > 0) {
						for (let rol of rolesDesmarcados) {
							if (roles.hasOwnProperty(rol)) {
								let userHasRol = editingUsuario.roles.find(
									({ rol: oldRol }) => oldRol == rol
								);
								if (userHasRol) {
									try {
										if (
											rol == 'coordinador' &&
											editingUsuario.id == $session.user.id
										)
											throw Error('No puedes quitarte el cargo de coordinador');
										await roles[rol].deleteItem(userHasRol.id);
									} catch (e: any) {
										toasts.error(e);
									}
								}
							}
						}
					}

					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error(
						'Ha habido un error. Asegurese que la matricula es única'
					);
				}

				rolesIniciales = rolesSeleccionados;
			} else {
				try {
					let newUsuario = await db_usuarios.addItem(formData);
					if (!newUsuario) return;

					if (rolesList.length > 0) {
						for (let rol of rolesList) {
							if (roles.hasOwnProperty(rol)) {
								await roles[rol].addItem({ id_usuario: newUsuario.id });
							}
						}
					}

					toasts.success();
					form = clearForm(form);
					rolesSeleccionados = [];
				} catch (e: any) {
					let msg = getErrorMsg(e);
					if (msg) {
						toasts.error(msg);
					} else {
						toasts.error(
							'Ha habido un error. Compruebe que no es una matricula duplicada'
						);
					}
				}
			}
		}
	};
</script>

<form
	on:submit|preventDefault={rolesSeleccionados.includes('coordinador')
		? () =>
				prompts.showPrompt({
					message:
						'Acabas de marcar a este usuario como coordinador. Con este rol podrá acceder a los registros, editarlos y eliminarlos, ¿Estás seguro?',
					type: 'danger',
					onAccept: handleSubmit,
				})
		: handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	<header class="flex justify-between">
		<h2 class="heading">Usuario</h2>
		<button class="btn primary">
			{#if editingUsuario}
				Editar usuario
			{:else}
				Guardar usuario
			{/if}
		</button>
	</header>

	<div class="input-group">
		<label class="label">Matricula</label>
		<input type="number" bind:value={form.matricula} required />
	</div>

	<div class="input-group">
		<label class="label">Nombre(s)</label>
		<input type="text" bind:value={form.nombre} required />
	</div>

	<div class="form-row">
		<div class="input-group">
			<label class="label">Apellido paterno</label>
			<input type="text" bind:value={form.apellido_paterno} required />
		</div>

		<div class="input-group">
			<label class="label">Apellido materno</label>
			<input type="text" bind:value={form.apellido_materno} required />
		</div>
	</div>

	<div class="input-group">
		<label class="label">Correo</label>
		<input type="email" bind:value={form.correo} required />
	</div>

	{#if !editingUsuario}
		<div class="input-group">
			<label class="label">Contraseña por defecto</label>
			<input type="text" bind:value={form.password} required />
			<p class="helper">
				El usuario podrá cambiar su contraseña una vez dentro
			</p>
		</div>
	{/if}

	<p class="label">Selecciona roles de usuario</p>
	<div class="flex flex-col gap-1 overflow-auto">
		<label class="flex gap-2 items-center">
			<input type="checkbox" bind:group={rolesSeleccionados} value="docente" />
			Docente
		</label>
		<label class="flex gap-2 items-center">
			<input type="checkbox" bind:group={rolesSeleccionados} value="coach" />
			Coach
		</label>
		<label class="flex gap-2 items-center">
			<input
				type="checkbox"
				bind:group={rolesSeleccionados}
				value="instructor"
			/>
			Instructor
		</label>
		<label class="flex gap-2 items-center">
			<input
				type="checkbox"
				bind:group={rolesSeleccionados}
				value="coordinador"
			/>
			Coordinador
		</label>
		<label class="flex gap-2 items-center">
			<input
				type="checkbox"
				bind:group={rolesSeleccionados}
				value="administrativo"
			/>
			Administrativo
		</label>
	</div>
</form>
