<script lang="ts">
	import type { AsistenteEnCursoConfirmado } from '$lib/stores/lists/jornada/asistentesEnCursoConfirmados';
	import AlumnoDetalles from './alumnoDetalles.svelte';

	export let alumnos: AsistenteEnCursoConfirmado[] | undefined;
</script>

{#if alumnos}
	{#if alumnos.length == 0}
		<p class="text-text-4">No hay alumnos inscritos en este curso aún.</p>
	{:else}
		<p class="label">Tienes {alumnos.length} alumnos</p>
		<section class="flex flex-col gap-8 mt-4">
			{#each alumnos as alumno (alumno.id)}
				<AlumnoDetalles {alumno} />
			{/each}
		</section>
	{/if}
{/if}
