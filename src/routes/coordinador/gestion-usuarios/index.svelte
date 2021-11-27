<script lang="ts">
	import { session } from '$app/stores';
	import Modal from '$lib/components/common/modal.svelte';
	import { db_usuarios } from '$lib/stores/db';
	import {
		UsuarioConRoles,
		usuariosConRoles,
	} from '$lib/stores/lists/usuariosConRoles';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toasts';
	import { useModal } from '$lib/stores/useModal';
	import { capitalizeString } from '$lib/utils/capitalizeString';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';
	import UsuarioForm from './_modules/usuarioForm.svelte';

	let filterText: string;
	let filterFunction: (usuario: UsuarioConRoles) => boolean;
	let filterGroup: string[] = [];
	$: if (filterGroup.length > 0) {
		filterFunction = (usuario) =>
			usuario.roles
				.map(({ rol }) => rol)
				.some((rol) => filterGroup.includes(rol));
	} else {
		filterFunction = (usuario) => true;
	}

	let editingUserID: number | undefined;
	let editingUser: UsuarioConRoles | undefined;
	$: editingUser = $usuariosConRoles.find((u) => u.id == editingUserID);

	const agregarUsuarioForm = useModal();
	const editarUsuarioForm = useModal();
</script>

{#if $agregarUsuarioForm}
	<Modal handleClose={agregarUsuarioForm.closeModal}>
		<UsuarioForm />
	</Modal>
{/if}

{#if $editarUsuarioForm}
	<Modal handleClose={editarUsuarioForm.closeModal}>
		<UsuarioForm
			editingUsuario={editingUser}
			form={{
				matricula: editingUser?.matricula,
				nombre: editingUser?.nombre,
				apellido_paterno: editingUser?.apellido_paterno,
				apellido_materno: editingUser?.apellido_materno,
				correo: editingUser?.correo,
				password: '',
			}}
			rolesSeleccionados={editingUser?.roles.map(({ rol }) => rol)}
		/>
	</Modal>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="heading">Usuarios en el sistema</h2>
	<button class="btn primary" on:click={agregarUsuarioForm.openModal}
		>Agregar usuarios
	</button>
</header>

<hr class="my-4 border-none" />

<p class="label">Buscar usuario</p>
<input type="text" bind:value={filterText} />

<hr class="my-4 border-none" />

<p class="label">Filtrar por</p>
<div class="flex gap-4 flex-wrap">
	<label class="flex gap-1 items-center">
		<input type="checkbox" value="docente" bind:group={filterGroup} />
		Docentes
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" value="coach" bind:group={filterGroup} />
		Coaches
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" value="instructor" bind:group={filterGroup} />
		Instructores
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" value="coordinador" bind:group={filterGroup} />
		Coordinadores
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" value="administrativo" bind:group={filterGroup} />
		Administrativo
	</label>
</div>

<hr class="my-4 border-none" />

<table id="table" class="table-fixed table shadow-lg w-full">
	<thead>
		<tr>
			<th class="w-24">Matricula</th>
			<th>Nombre de usuario</th>
			<th>Correo</th>
			<th>Roles</th>
			<th>...</th>
		</tr>
	</thead>
	<tbody class="">
		{#each makeArraySearchable($usuariosConRoles, ['matricula', 'nombre', 'apellido_paterno', 'apellido_materno', 'correo'], filterText).filter(filterFunction) as usuario (usuario.id)}
			<tr>
				<td><a href="">{usuario.matricula}</a></td>
				<td
					>{usuario.nombre}
					{usuario.apellido_paterno}
					{usuario.apellido_materno}</td
				>
				<td>{usuario.correo}</td>
				<td>
					{#if usuario.roles.length == 0}
						<p class="text text-text-4">Sin roles asignados</p>
					{:else}
						{usuario.roles.map(({ rol }) => capitalizeString(rol)).join(', ')}
					{/if}
				</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button
							class="link primary"
							on:click={() => {
								editingUserID = usuario.id;
								editarUsuarioForm.openModal();
							}}>Editar usuario</button
						>
						{#if $session.user.id != usuario.id && !usuario.roles
								.map(({ rol }) => rol)
								.includes('coordinador')}
							<button
								class="link"
								on:click={() => {
									prompts.showPrompt({
										message: `¿Estás seguro que quieres borrar a ${usuario.nombre}? Si lo borras todos sus registros se borraran con él.`,
										type: 'danger',
										onAccept: async () => {
											try {
												await db_usuarios.deleteItem(usuario.id);
												toasts.success();
											} catch (e) {
												console.error();
												toasts.error();
											}
										},
									});
								}}>Eliminar usuario</button
							>
						{/if}
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
