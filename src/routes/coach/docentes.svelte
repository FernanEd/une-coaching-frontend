<script lang="ts">
	import { currentUser } from '$lib/stores/currentUser';
	import { coachList } from '$lib/stores/lists/coachList';

	$: currentCoach = $coachList.find((d) => d.id == $currentUser.id);
</script>

<main>
	{#each currentCoach.docentes as docente (docente.id)}
		<p>{docente.nombre}</p>
	{/each}
</main>
