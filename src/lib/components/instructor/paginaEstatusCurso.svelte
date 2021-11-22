<script lang="ts">
	import { asistentesEnCurso } from '$lib/stores/db/asistentesEnCurso';
	import { cursosEnJornada } from '$lib/stores/db/cursosEnJornada';

	import type { AsistenteDeCursoDeInstructor } from '$lib/stores/instructorPortal';
	import { toasts } from '$lib/stores/toastlist';

	export let goBack;
	export let alumnos: AsistenteDeCursoDeInstructor[] = [];
	export let cursoEnJornadaID: number;
	export let isCompleted: boolean;

	const marcarCursoCompletado = async () => {
		try {
			await cursosEnJornada.updateItem(cursoEnJornadaID, {
				estado: 1
			});
			toasts.success();
		} catch (e) {
			console.log(e);
			toasts.error();
		}
	};

	const abrirCurso = async () => {
		try {
			await cursosEnJornada.updateItem(cursoEnJornadaID, {
				estado: 0
			});
			toasts.success();
		} catch (e) {
			console.log(e);
			toasts.error();
		}
	};
</script>

<button class="link" on:click={goBack}>← Volver atrás</button>

<h2 class="heading mt-4">Estatus del curso</h2>

<section class="flex flex-col gap-8 mt-4">
	<article
		class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"
	>
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

		{#if isCompleted}
			<button
				class="btn"
				on:click={() => {
					abrirCurso();
				}}>Abrir curso</button
			>
		{:else}
			<button
				class="btn primary"
				on:click={() => {
					marcarCursoCompletado();
				}}>Marcar curso como completado</button
			>
		{/if}
	</article>
</section>
