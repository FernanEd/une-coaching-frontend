<script>
	import MobileLayout from '$lib/layout/mobileLayout.svelte';
</script>

<MobileLayout
	layoutHeading="Portal Docente"
	bgColor="bg-une-red"
	tabs={[
		{ 'Mis cursos': '/docente/mis-cursos' },
		{ 'Mis acreditaciones': '/docente/mis-acreditaciones' }
	]}
>
	<slot />
</MobileLayout>
