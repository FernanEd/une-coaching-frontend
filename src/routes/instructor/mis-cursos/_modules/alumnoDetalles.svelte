<script lang="ts">
	import { db_asistentesEnCurso } from '$lib/stores/db';

	import type { AsistenteEnCursoConfirmado } from '$lib/stores/lists/jornada/asistentesEnCursoConfirmados';
	import { toasts } from '$lib/stores/toasts';
	import { handleError } from '$lib/utils/handleError';

	export let alumno: AsistenteEnCursoConfirmado;
	export let estaAprobado = alumno.aprobado ? 1 : 0;

	const calificar = async (aprobado: boolean) => {
		estaAprobado = alumno.aprobado ? 1 : 0;
		try {
			await db_asistentesEnCurso.updateItem(alumno.id, {
				aprobado,
			});
			toasts.success();
		} catch (e) {
			handleError(e);
		}
	};
</script>

<article class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4">
	<div>
		<p class="label">Matricula: {alumno.docente.matricula}</p>
		<p>
			{alumno.docente.nombre}
			{alumno.docente.apellido_paterno}
			{alumno.docente.apellido_materno}
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
