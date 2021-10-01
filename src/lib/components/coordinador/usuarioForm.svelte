<script lang="ts">
	import {
		administrativos,
		coaches,
		coordinadores,
		docentes,
		instructores,
		usuarios
	} from '$lib/stores/db';
	import type { Usuario } from '$lib/utils/interfaces';
	import { tick } from 'svelte';

	let form: Omit<Usuario, 'id'> = {
		matricula: undefined,
		nombre: undefined,
		apellido_paterno: undefined,
		apellido_materno: undefined,
		correo: undefined,
		password: undefined
	};
	let rolesSeleccionados: string[] = [];

	const roles: Object = {
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
		<button class="btn primary">Agregar usuario</button>
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

	<div class="input-group">
		<label class="label">Contraseña por defecto</label>
		<input type="text" bind:value={form.password} required />
	</div>

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

<style lang="postcss">
	.input-group {
		@apply flex flex-col;
	}
	.form-row {
		@apply flex gap-4;
	}

	.form-row > * {
		@apply flex-1;
	}
</style>
