<script lang="ts">
	let filterText: string;

	const handleFilterField = () => {
		console.log(filterText);
	};
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
		<input type="checkbox" />
		Coachees
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" />
		Coaches
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" />
		Instructores
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" />
		Coordinadores
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" />
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
		{#each [...Array(20).fill(0)] as i}
			<tr>
				<td><a href="#">174819</a></td>
				<td>Fernando Edmundo Balderas Morán</td>
				<td>fernandoed.bm@gmail.com</td>
				<td>Coachee, Coach</td>
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
