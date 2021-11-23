<script lang="ts">
	import UsuarioForm from '$lib/components/coordinador/usuarioForm.svelte';

	import Modal from '$lib/components/modal.svelte';
	import { useModal } from '$lib/stores/modal';

	import {
		Rol,
		UsuarioConRoles,
		usuarioList
	} from '$lib/stores/lists/usuariosList';
	import { usuarios } from '$lib/stores/db/usuarios';
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toastlist';
	import { currentUser as currentCoordinator } from '$lib/stores/currentUser';

	let addUsuarioModal = useModal();
	let updateUsuarioModal = useModal();

	let currentUserID: number;
	$: currentUser =
		$usuarioList[
			$usuarioList.findIndex(({ id }) => id == currentUserID)
		];
	let filterText: string;
	let filterGroup: string[] = [];
	let filterFunction: (usuario: UsuarioConRoles) => boolean = (
		usuario
	) => true;

	$: if (filterGroup.length > 0) {
		filterFunction = (usuario) =>
			usuario.roles.some(({ rol }) => filterGroup.includes(rol));
	} else {
		filterFunction = (usuario) => true;
	}

	const deleteUser = async (id: number) => {
		try {
			await usuarios.removeItem(id);
			toasts.success();
		} catch (e) {
			console.error(e);
			toasts.error();
		}
	};
</script>

{#if $addUsuarioModal}
	<Modal handleClose={addUsuarioModal.closeModal}
		><UsuarioForm /></Modal
	>
{/if}

{#if $updateUsuarioModal}
	<Modal handleClose={updateUsuarioModal.closeModal}
		><UsuarioForm
			isEditing
			editingUser={currentUser}
			form={{
				matricula: currentUser.matricula,
				nombre: currentUser.nombre,
				apellido_paterno: currentUser.apellido_paterno,
				apellido_materno: currentUser.apellido_materno,
				correo: currentUser.correo,
				password: currentUser.password
			}}
			rolesSeleccionados={currentUser.roles.map(({ rol }) => rol)}
		/></Modal
	>
{/if}

<header class="flex justify-between flex-wrap">
	<h2 class="heading">Usuarios</h2>
	<button class="btn primary" on:click={addUsuarioModal.openModal}
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
		<input
			type="checkbox"
			value="instructor"
			bind:group={filterGroup}
		/>
		Instructores
	</label>
	<label class="flex gap-1 items-center">
		<input
			type="checkbox"
			value="coordinador"
			bind:group={filterGroup}
		/>
		Coordinadores
	</label>
	<label class="flex gap-1 items-center">
		<input
			type="checkbox"
			value="administrativo"
			bind:group={filterGroup}
		/>
		Administrativo
	</label>
</div>

<hr class="my-4 border-none" />

{#if $usuarioList.filter(filterFunction).length == 0}
	<p>No hay usuarios aún</p>
{:else}
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
			{#each makeArraySearchable($usuarioList, ['nombre', 'apellido_paterno', 'apellido_materno'], filterText).filter(filterFunction) as usuario (usuario.id)}
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
							{usuario.roles
								.map(({ rol: w }) => w[0].toUpperCase() + w.substr(1))
								.join(', ')}
						{/if}
					</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="link primary"
								on:click={() => {
									updateUsuarioModal.openModal();
									currentUserID = usuario.id;
								}}>Editar usuario</button
							>
							{#if $currentCoordinator.id == usuario.id}
								<p />
							{:else}
								<button
									class="link"
									on:click={() => {
										prompts.showPrompt({
											message: `¿Estás seguro que quieres borrar a ${usuario.nombre}? Si lo borras todos sus registros se borraran con él.`,
											type: 'danger',
											onAccept: () => deleteUser(usuario.id)
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
{/if}
