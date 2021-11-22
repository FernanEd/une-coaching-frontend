<script lang="ts">
	import { asistentesEnCurso } from '$lib/stores/db/asistentesEnCurso';
	import type { AsistenteDeCursoDeInstructor } from '$lib/stores/instructorPortal';
	import { toasts } from '$lib/stores/toastlist';
	import AlumnoDetalles from './AlumnoDetalles.svelte';
	export let alumnos: AsistenteDeCursoDeInstructor[] = [];
</script>

<h2 class="heading">Alumnos ({alumnos.length})</h2>
<section class="flex flex-col gap-8 mt-4">
	{#each alumnos as alumno, indx (alumno.id)}
		<AlumnoDetalles {alumno} />
	{/each}
</section>
