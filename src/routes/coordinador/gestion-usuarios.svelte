<script lang="ts">
	import {
		administrativos,
		coaches,
		coordinadores,
		docentes,
		instructores,
		usuarios
	} from '$lib/stores/db';
	import { usuarioList } from '$lib/stores/usuariosList';
	import { derived } from 'svelte/store';

	let filterText: string;
	let filterGroup: string[] = [];

	const handleFilterField = () => {
		console.log(filterText);
	};

	let filterFunction: (val: any) => boolean = (val) => true;

	$: if (filterGroup.length > 0) {
		filterFunction = (val: { roles: string[] }) =>
			val.roles.some((rol) => filterGroup.includes(rol));
	} else {
		filterFunction = (val) => true;
	}
</script>

<header class="flex justify-between flex-wrap">
	<h2 class="heading">Usuarios</h2>
	<button class="btn primary">Agregar usuarios </button>
</header>

<hr class="my-4 border-none" />

<p class="label">Buscar usuario por matricula</p>
<input
	type="text"
	bind:value={filterText}
	on:input={handleFilterField}
/>

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
			{#each $usuarioList.filter(filterFunction) as usuario (usuario.id)}
				<tr>
					<td><a href="">{usuario.matricula}</a></td>
					<td
						>{usuario.nombre}
						{usuario.apellido_paterno}
						{usuario.apellido_materno}</td
					>
					<td>{usuario.correo}</td>
					<td
						>{usuario.roles
							.map((w) => w[0].toUpperCase() + w.substr(1))
							.join(', ')}</td
					>
					<td>
						<span class="flex gap-8 justify-center">
							<button class="text-accent font-bold"
								>Editar usuario</button
							>
							<button class="text-text-4 font-bold"
								>Eliminar usuario</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
