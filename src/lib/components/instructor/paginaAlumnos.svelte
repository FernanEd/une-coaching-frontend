<script lang="ts">
	import { asistentesEnCurso } from '$lib/stores/db/asistentesEnCurso';

	import type { AsistenteDeCursoDeInstructor } from '$lib/stores/instructorPortal';

	export let goBack;
	export let alumnos: AsistenteDeCursoDeInstructor[] = [];
	let calificacion: number;

	const asignarCalificacion = (asistenteID: number) => {
		if (calificacion) {
			asistentesEnCurso.updateItem(asistenteID, {
				calificacion
			});
		}
	};
</script>

<button class="link" on:click={goBack}>← Volver atrás</button>

<h2 class="heading mt-4">Alumnos ({alumnos.length})</h2>

<section class="flex flex-col gap-8 mt-4">
	{#each alumnos as alumno (alumno.id)}
		<article
			class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"
		>
			<div>
				<p class="label">Matricula: {alumno.usuario.matricula}</p>

				<p>
					{alumno.usuario.nombre}
					{alumno.usuario.apellido_paterno}
					{alumno.usuario.apellido_materno}
				</p>
			</div>

			<form
				class="flex flex-col gap-4"
				on:submit|preventDefault={() =>
					asignarCalificacion(alumno.id)}
			>
				<div>
					<p class="label">Calificación</p>
					<input
						type="number"
						value={alumno.calificacion}
						on:input={(e) => {
							calificacion = Number(e.currentTarget.value);
						}}
					/>
				</div>

				<div class="flex gap-8 justify-center">
					<button class="link primary">Calificar docente</button>
				</div>
			</form>
		</article>
	{/each}
</section>
