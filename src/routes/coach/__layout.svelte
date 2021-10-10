<script>
	import MobileLayout from '$lib/layout/mobileLayout.svelte';
</script>

<MobileLayout
	layoutHeading="Portal coach"
	bgColor="bg-une-gold"
	tabs={[
		{ Docentes: '/coach/docentes' },
		{ Inscripciones: '/coach/inscripciones' }
	]}
>
	<slot />
</MobileLayout>
