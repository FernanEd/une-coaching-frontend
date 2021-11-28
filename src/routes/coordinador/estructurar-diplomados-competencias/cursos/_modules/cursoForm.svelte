<script lang="ts">
	import { db_cursos, db_diplomados } from '$lib/stores/db';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toasts';
	import { clearForm } from '$lib/utils/clearForm';
	import type { Curso } from '$lib/utils/types/db';
	import type { MayBeUndefined } from '$lib/utils/types/forms';

	export let editingCursoID: number | undefined = undefined;
	export let form: MayBeUndefined<Omit<Curso, 'id'>> = {
		nombre: undefined,
		id_diplomado: undefined,
	};
	export let selectedDiplomadoID: number | null = null;

	$: console.log(selectedDiplomadoID);

	const handleSubmit = async () => {
		const formData = { ...form };

		if (formData.nombre) {
			if (editingCursoID) {
				try {
					await db_cursos.updateItem(editingCursoID, {
						nombre: formData.nombre,
						id_diplomado: null,
					});

					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
			} else {
				try {
					await db_cursos.addItem({
						nombre: formData.nombre,
						id_diplomado: selectedDiplomadoID,
					});

					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}

				selectedDiplomadoID = null;
				form = clearForm(form);
			}
		}
	};
</script>

<form
	on:submit|preventDefault={editingCursoID
		? () =>
				prompts.showPrompt({
					type: 'danger',
					message:
						'Editar un curso repercutirá en todos los registros de acreditaciones. ¿Estás seguro?',
					onAccept: handleSubmit,
				})
		: handleSubmit}
	class="flex flex-col max-w-xl w-screen gap-4"
>
	<header class="flex justify-between">
		<h2 class="heading">Curso</h2>
		{#if editingCursoID}
			<button class="btn primary">Editar curso</button>
		{:else}
			<button class="btn primary">Guardar curso</button>
		{/if}
	</header>

	<div>
		<p class="label">Nombre del curso</p>
		<input type="text" class="w-full" required bind:value={form.nombre} />
	</div>

	<div>
		<p class="label">Diplomado del curso</p>
		<select class="w-full" bind:value={selectedDiplomadoID}>
			<option value={null}>Sin diplomado</option>
			{#each $db_diplomados as diplomado (diplomado.id)}
				<option value={diplomado.id}>{diplomado.nombre}</option>
			{/each}
		</select>
	</div>
</form>
