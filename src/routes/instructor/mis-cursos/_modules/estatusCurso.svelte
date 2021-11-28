<script lang="ts">
	import { db_cursosEnJornada } from '$lib/stores/db';
	import type { AsistenteEnCursoConfirmado } from '$lib/stores/lists/jornada/asistentesEnCursoConfirmados';
	import { prompts } from '$lib/stores/prompts';
	import { toasts } from '$lib/stores/toasts';

	export let cursoEnJornadaID: number | undefined;
	export let alumnos: AsistenteEnCursoConfirmado[] | undefined = undefined;
	export let isCompleted: boolean;

	const closeCurso = async () => {
		if (cursoEnJornadaID) {
			try {
				await db_cursosEnJornada.updateItem(cursoEnJornadaID, {
					estado: 1,
				});
				toasts.success();
			} catch (e) {
				console.log(e);
				toasts.error();
			}
		}
	};

	const openCurso = async () => {
		if (cursoEnJornadaID) {
			try {
				await db_cursosEnJornada.updateItem(cursoEnJornadaID, {
					estado: 0,
				});
				toasts.success();
			} catch (e) {
				console.log(e);
				toasts.error();
			}
		}
	};
</script>

<h2 class="heading mt-4">Estatus del curso</h2>

<section class="flex flex-col gap-8 mt-4">
	<article class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4">
		{#if alumnos}
			<div>
				<p class="label">Aprobados</p>

				<p>
					{alumnos.filter((a) => a.aprobado).length}
				</p>
			</div>

			<div>
				<p class="label">Reprobados</p>
				<p>
					{alumnos.filter((a) => !a.aprobado).length}
				</p>
			</div>

			<div>
				<p class="label">Porcentaje de aprobados</p>
				<p>
					{(((alumnos.filter((a) => a.aprobado).length /
						(alumnos.length || 1)) *
						10000) |
						0) /
						100} %
				</p>
			</div>
		{/if}

		{#if isCompleted}
			<button
				class="link primary"
				on:click={() =>
					prompts.showPrompt({
						type: 'danger',
						message:
							'¿Estás seguro de que quieres abrir este curso? Repercutirá en el proceso de evaluaciones.',
						onAccept: openCurso,
					})}>Abrir curso</button
			>
		{:else}
			<button
				class="btn primary"
				on:click={() =>
					prompts.showPrompt({
						type: 'danger',
						message:
							'¿Estás seguro de que quieres cerrar este curso? Asegúrate que hayas calificado a todos los docentes.',
						onAccept: closeCurso,
					})}>Marcar curso como completado</button
			>
		{/if}
	</article>
</section>
