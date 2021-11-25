<script lang="ts">
	import MobileLayout from '$lib/components/layout/mobileLayout.svelte';
</script>

<MobileLayout
	layoutHeading="Portal coach"
	bgColor="bg-une-gold"
	tabs={[
		{ Docentes: '/coach/docentes' },
		{ Inscripciones: '/coach/inscripciones' },
	]}
>
	<slot />
</MobileLayout>
