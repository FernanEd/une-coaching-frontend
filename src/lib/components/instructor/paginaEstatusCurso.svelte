<script lang="ts">
	import { asistentesEnCurso } from '$lib/stores/db/asistentesEnCurso';
	import { cursosEnJornada } from '$lib/stores/db/cursosEnJornada';

	import type { AsistenteDeCursoDeInstructor } from '$lib/stores/instructorPortal';

	export let goBack;
	export let alumnos: AsistenteDeCursoDeInstructor[] = [];
	export let cursoEnJornadaID: number;
	export let isCompleted: boolean;

	const marcarCursoCompletado = () => {
		cursosEnJornada.updateItem(cursoEnJornadaID, {
			estado: 1
		});
	};

	const abrirCurso = () => {
		cursosEnJornada.updateItem(cursoEnJornadaID, {
			estado: 0
		});
	};

	$: masBajo =
		alumnos.length > 0
			? alumnos.reduce((a, b) =>
					a.calificacion < b.calificacion ? a : b
			  )
			: undefined;
	$: masAlto =
		alumnos.length > 0
			? alumnos.reduce((a, b) =>
					a.calificacion > b.calificacion ? a : b
			  )
			: undefined;
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
				{alumnos.filter((a) => a.calificacion >= 7).length}
			</p>
		</div>

		<div>
			<p class="label">Reprobados</p>
			<p>
				{alumnos.filter((a) => a.calificacion < 7).length}
			</p>
		</div>

		{#if alumnos.length > 0}
			<div>
				<p class="label">Calificación promedio</p>
				<p>
					{alumnos.reduce((a, b) => a + b.calificacion, 0) /
						alumnos.length}
				</p>
			</div>
		{/if}

		{#if masAlto}
			<div>
				<p class="label">Calificación más alta</p>
				<p>
					{masAlto.usuario.nombre}
					{masAlto.usuario.apellido_paterno}
					{masAlto.usuario.apellido_materno} ({masAlto.calificacion})
				</p>
			</div>
		{/if}

		{#if masBajo}
			<div>
				<p class="label">Calificación más baja</p>
				<p>
					{masBajo.usuario.nombre}
					{masBajo.usuario.apellido_paterno}
					{masBajo.usuario.apellido_materno} ({masBajo.calificacion})
				</p>
			</div>
		{/if}
	</article>

	{#if isCompleted}
		<button
			class="link"
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
</section>
