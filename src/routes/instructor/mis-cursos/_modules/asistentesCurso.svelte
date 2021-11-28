<script lang="ts">
	import type { AsistenteEnCursoConfirmado } from '$lib/stores/lists/jornada/asistentesEnCursoConfirmados';
	import AlumnoDetalles from './alumnoDetalles.svelte';

	export let alumnos: AsistenteEnCursoConfirmado[] = [];
</script>

<h2 class="heading">Alumnos ({alumnos.length})</h2>
<section class="flex flex-col gap-8 mt-4">
	{#each alumnos as alumno (alumno.id)}
		<AlumnoDetalles {alumno} />
	{/each}
</section>
