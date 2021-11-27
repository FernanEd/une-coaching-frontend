<script lang="ts">
	import { db_competencias, db_tiposCompetencias } from '$lib/stores/db';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toasts';
	import { clearForm } from '$lib/utils/clearForm';
	import type { Competencia } from '$lib/utils/types/db';
	import type { MayBeUndefined } from '$lib/utils/types/forms';

	export let competenciaID: number | undefined = undefined;
	export let form: MayBeUndefined<Omit<Competencia, 'id'>> = {
		nombre: undefined,
		id_tipo: undefined,
	};
	export let selectedTipo: number | null = null;

	$: console.log(selectedTipo);

	const handleSubmit = async () => {
		const formData = { ...form };

		if (formData.nombre) {
			if (competenciaID) {
				try {
					await db_competencias.updateItem(competenciaID, {
						nombre: formData.nombre,
						id_tipo: selectedTipo,
					});

					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
			} else {
				try {
					await db_competencias.addItem({
						nombre: formData.nombre,
						id_tipo: selectedTipo,
					});

					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}

				form = clearForm(form);
			}
		}
	};
</script>

<form
	on:submit|preventDefault={competenciaID
		? () =>
				prompts.showPrompt({
					type: 'danger',
					message:
						'Editar una competencia repercutirá en todos los registros de acreditaciones. ¿Estás seguro?',
					onAccept: handleSubmit,
				})
		: handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	<header class="flex justify-between">
		<h2 class="heading">Competencia</h2>
		{#if competenciaID}
			<button class="btn primary">Editar competencia</button>
		{:else}
			<button class="btn primary">Guardar competencia</button>
		{/if}
	</header>

	<div>
		<p class="label">Nombre de la competencia</p>
		<input type="text" class="w-full" required bind:value={form.nombre} />
	</div>

	<div>
		<p class="label">Tipo de la competencia</p>
		<select class="w-full" bind:value={selectedTipo}>
			<option value={null}>Sin tipo</option>
			{#each $db_tiposCompetencias as tipoCompetencia (tipoCompetencia.id)}
				<option value={tipoCompetencia.id}>{tipoCompetencia.nombre}</option>
			{/each}
		</select>
	</div>
</form>
