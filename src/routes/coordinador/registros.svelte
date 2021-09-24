<script lang="ts">
	let filterText: string;

	const handleFilterField = () => {
		console.log(filterText);
	};
</script>

<header class="flex justify-between flex-wrap">
	<h2 class="text-2xl font-bold">Registros de acreditaciones</h2>
	<button
		class="px-4 py-2 bg-accent 
  rounded-full shadow-xl 
  font-bold text-text-inv"
		>Agregar acreditación
	</button>
</header>

<hr class="my-4 border-none" />

<label>
	<p class="leyenda text-text-4 text-xs">
		Buscar usuario por matricula
	</p>
	<input
		type="text"
		bind:value={filterText}
		on:input={handleFilterField}
	/>
</label>

<hr class="my-4 border-none" />

<p class="leyenda text-text-4 text-xs">Filtrar por</p>
<div class="flex gap-4 flex-wrap">
	<label class="flex gap-1 items-center">
		<input type="checkbox" />
		Cursos
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" />
		Diplomados
	</label>
	<label class="flex gap-1 items-center">
		<input type="checkbox" />
		Competencias
	</label>
</div>

<hr class="my-4 border-none" />

<table id="table" class="table-fixed table shadow-lg w-full">
	<thead>
		<tr>
			<th>Acreditación</th>
			<th>Acreditor</th>
			<th>Expeditor</th>
			<th class="w-48">Fecha de expedición</th>
			<th>Documento</th>
			<th>...</th>
		</tr>
	</thead>
	<tbody class="">
		{#each [...Array(20).fill(0)] as i}
			<tr>
				<td>
					{#if Math.random() > 0.5}
						<p class="font-bold text-text-4 text-sm">
							Competencia basica
						</p>
						<p>Planeación</p>
					{:else if Math.random() > 0.5}
						<p class="font-bold text-text-4 text-sm">Diplomado</p>
						<p>Diplomado en estrategias de aprendizaje</p>
					{:else if Math.random() > 0.5}
						<p class="font-bold text-text-4 text-sm">Curso</p>
						<p>Aprendizaje Basado en Problemas</p>
					{:else}
						<p class="font-bold text-text-4 text-sm">Diplomado</p>
						<p>Diplomado en buenas prácticas docentes</p>
					{/if}
				</td>
				<td>
					<a href="#">174819</a>
					<p>Fernando Edmundo Balderas Morán</p>
				</td>
				<td>
					<a href="#">170099</a>
					<p>Alejandro Larraga Gonzalez</p>
				</td>
				<td>26/09/2022</td>
				<td>
					<a href="#">Descargar documento</a>
				</td>
				<td>
					<span class="flex gap-8 justify-center">
						<button class="text-accent font-bold"
							>Editar acreditación</button
						>
						<button class="text-text-4 font-bold"
							>Eliminar acreditación</button
						>
					</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
