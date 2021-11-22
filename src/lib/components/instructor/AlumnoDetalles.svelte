<script lang="ts">
	import { asistentesEnCurso } from '$lib/stores/db/asistentesEnCurso';

	import type { AsistenteDeCursoDeInstructor } from '$lib/stores/instructorPortal';
	import { toasts } from '$lib/stores/toastlist';

	export let alumno: AsistenteDeCursoDeInstructor;
	export let estaAprobado = alumno.aprobado ? 1 : 0;

	const calificar = async (aprobado: boolean) => {
		estaAprobado = alumno.aprobado ? 1 : 0;
		try {
			await asistentesEnCurso.updateItem(alumno.id, {
				aprobado
			});
			toasts.success();
		} catch (e) {
			toasts.error();
		}
	};
</script>

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

	<div>
		<p class="label">Calificación</p>
		<div class="flex gap-8 justify-center">
			<label class="flex gap-2 items-center">
				<input
					type="radio"
					bind:group={estaAprobado}
					on:click={() => calificar(false)}
					value={0}
					required
				/>
				Reprobado
			</label>
			<label class="flex gap-2 items-center">
				<input
					type="radio"
					bind:group={estaAprobado}
					on:click={() => calificar(true)}
					value={1}
					required
				/>
				Aprobado
			</label>
		</div>
	</div>
</article>
