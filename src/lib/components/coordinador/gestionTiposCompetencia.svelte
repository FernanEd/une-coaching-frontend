<script lang="ts">
	import { cursos } from '$lib/stores/db/cursos';
	import { tiposCompetencias } from '$lib/stores/db/tipoCompetencias';
	import type { TipoCompetencia } from '$lib/utils/interfaces';

	let tipoCompetenciaName;
	let currentID;

	const handleSubmit = () => {
		if (tipoCompetenciaName) {
			if (currentID) {
				tiposCompetencias.updateItem(currentID, {
					nombre: tipoCompetenciaName
				});
				currentID = undefined;
			} else {
				tiposCompetencias.addItem({
					nombre: tipoCompetenciaName
				});
			}
			tipoCompetenciaName = '';
		}
	};

	const handleUpdate = (tipoCompetencia: TipoCompetencia) => {
		currentID = tipoCompetencia.id;
		tipoCompetenciaName = tipoCompetencia.nombre;
	};
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col gap-4 w-screen max-w-xl"
>
	<header class="flex justify-between flex-wrap">
		<h2 class="heading">Tipos de competencias</h2>
		{#if currentID}
			<button class="btn primary">Editar tipo </button>
		{:else}
			<button class="btn primary">Agregar tipo </button>
		{/if}
	</header>

	<label class="w-full">
		<p class="label">Nombre del tipo de competencia</p>
		<input
			type="text"
			class="w-full"
			bind:value={tipoCompetenciaName}
			required
		/>
	</label>
</form>

<hr class="my-4 border-none" />

{#if $tiposCompetencias.length == 0}
	<p>No hay cursos aún.</p>
{:else}
	<table class="table-fixed table shadow-lg w-full max-w-xl">
		<thead>
			<tr>
				<th>Tipo de competencia</th>
				<th>...</th>
			</tr>
		</thead>
		<tbody class="max-h-60 overflow-auto">
			{#each $tiposCompetencias as tipoCompetencia (tipoCompetencia.id)}
				<tr>
					<td>{tipoCompetencia.nombre}</td>
					<td>
						<span class="flex gap-8 justify-center">
							<button
								class="font-bold text-accent"
								on:click={() => handleUpdate(tipoCompetencia)}
								>Editar tipo</button
							>
							<button
								class="font-bold text-text-4"
								on:click={() => cursos.removeItem(tipoCompetencia.id)}
								>Eliminar tipo</button
							>
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
