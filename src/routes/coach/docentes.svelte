<script lang="ts">
	import { currentUser } from '$lib/stores/currentUser';
	import { coachList } from '$lib/stores/lists/coachList';

	$: currentCoach = $coachList.find((d) => d.id == $currentUser.id);
</script>

<h2 class="heading">Docentes ({currentCoach.docentes.length})</h2>

<hr class="my-2 border-none" />

<section class="flex flex-col gap-8">
	{#each currentCoach.docentes as docente (docente.id)}
		<article
			class="flex flex-col p-4 gap-8 text-center rounded-2xl shadow-fix items-center"
		>
			<div>
				<p class="label">Matricula: {docente.matricula}</p>
				<p>
					{docente.nombre}
					{docente.apellido_paterno}
					{docente.apellido_materno}
				</p>
				<p>{docente.correo}</p>
			</div>

			<div>
				<p class="label">Resumen de estado</p>
				<p>x de x diplomados</p>
				<p>x de x competencias basicas</p>
				<p>x de x competencias adicionales</p>
			</div>

			<button class="link primary">Ver acreditaciones</button>
		</article>
	{/each}
</section>
