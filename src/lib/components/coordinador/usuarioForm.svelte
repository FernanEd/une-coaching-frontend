<script lang="ts">
	import { administrativos } from '$lib/stores/db/administrativos';

	import { coaches } from '$lib/stores/db/coaches';
	import { coordinadores } from '$lib/stores/db/coordinadores';

	import { docentes } from '$lib/stores/db/docentes';
	import { instructores } from '$lib/stores/db/instructores';

	import { usuarios } from '$lib/stores/db/usuarios';

	import type { UsuarioConRoles } from '$lib/stores/lists/usuariosList';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toastlist';
	import type { Docente, Usuario } from '$lib/utils/interfaces';
	import { tick } from 'svelte';

	export let editingUser: UsuarioConRoles = undefined;
	export let isEditing = false;
	export let form: Omit<Usuario, 'id'> = {
		matricula: undefined,
		nombre: undefined,
		apellido_paterno: undefined,
		apellido_materno: undefined,
		correo: undefined,
		password: undefined
	};
	export let rolesSeleccionados: string[] = [];
	let rolesIniciales = rolesSeleccionados;

	const roles = {
		docente: docentes,
		coach: coaches,
		administrativo: administrativos,
		instructor: instructores,
		coordinador: coordinadores
	};

	const handleSubmit = async () => {
		const formFields = Object.keys(form);
		const formData = { ...form };
		const fieldsFilled = formFields.every((key) => form[key]);
		const rolesList = [...rolesSeleccionados];

		if (fieldsFilled) {
			if (isEditing) {
				let rolesNuevos = rolesSeleccionados.filter(
					(rol) => !rolesIniciales.includes(rol)
				);
				let rolesDesmarcados = rolesIniciales.filter(
					(rol) => !rolesSeleccionados.includes(rol)
				);

				await tick();
				delete formData.password;
				usuarios.updateItem(editingUser.id, { ...formData });

				try {
					if (rolesNuevos.length > 0) {
						for (let rol of rolesNuevos) {
							if (roles.hasOwnProperty(rol)) {
								await roles[rol].addItem({
									id_usuario: editingUser.id
								});
							}
						}
					}

					if (rolesDesmarcados.length > 0) {
						for (let rol of rolesDesmarcados) {
							if (roles.hasOwnProperty(rol)) {
								await roles[rol].removeItem(
									editingUser.roles.find(
										({ rol: oldRol }) => oldRol == rol
									).id
								);
							}
						}
					}
					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}

				rolesIniciales = rolesSeleccionados;
			} else {
				formFields.forEach((key) => (form[key] = undefined));
				rolesSeleccionados = [];

				let { id: userID } = await usuarios.addItem(formData);
				if (rolesList.length > 0) {
					for (let rol of rolesList) {
						if (roles.hasOwnProperty(rol)) {
							roles[rol].addItem({ id_usuario: userID });
						}
					}
				}
			}
			await tick();
		}
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	<header class="flex justify-between">
		<h2 class="heading">Usuario</h2>
		<button class="btn primary">
			{#if isEditing}
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
			<input
				type="text"
				bind:value={form.apellido_paterno}
				required
			/>
		</div>

		<div class="input-group">
			<label class="label">Apellido materno</label>
			<input
				type="text"
				bind:value={form.apellido_materno}
				required
			/>
		</div>
	</div>

	<div class="input-group">
		<label class="label">Correo</label>
		<input type="email" bind:value={form.correo} required />
	</div>

	{#if !isEditing}
		<div class="input-group">
			<label class="label">Contraseña por defecto</label>
			<input type="text" bind:value={form.password} required />
		</div>
	{/if}

	<p class="label">Roles</p>
	<div class="flex flex-col gap-1 overflow-auto">
		<label class="flex gap-2 items-center">
			<input
				type="checkbox"
				bind:group={rolesSeleccionados}
				value="docente"
			/>
			Docente
		</label>
		<label class="flex gap-2 items-center">
			<input
				type="checkbox"
				bind:group={rolesSeleccionados}
				value="coach"
			/>
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
